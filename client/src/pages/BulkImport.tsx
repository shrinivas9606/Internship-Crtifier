import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addIntern } from "@/lib/firestore";
import { InsertIntern } from "@shared/schema";
import { Upload, Download, AlertCircle, CheckCircle2, FileText, Users } from "lucide-react";

interface CSVRecord {
  fullName: string;
  email: string;
  domain: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
  row: number;
}

interface ProcessResult {
  success: boolean;
  certificateId?: string;
  error?: string;
  row: number;
  intern: CSVRecord;
}

// Utility functions for date handling
const parseFirestoreDate = (date: any): Date => {
  if (date?.seconds) return new Date(date.seconds * 1000);
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

const formatDateForFirestore = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: ${dateString}`);
  return date;
};

export default function BulkImport() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const downloadTemplate = () => {
    const csvContent = `fullName,email,domain,startDate,endDate,status
John Doe,john.doe@example.com,Web Development,2024-01-15,2024-04-15,completed
Jane Smith,jane.smith@example.com,Data Science,2024-02-01,2024-05-01,active
Mike Johnson,mike.johnson@example.com,Mobile Development,2024-01-10,2024-04-10,completed`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'intern_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "Use this CSV template to format your intern data",
    });
  };

  const parseCSV = (csvText: string): CSVRecord[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const requiredFields = ['fullName', 'email', 'domain', 'startDate', 'endDate', 'status'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }

    const records: CSVRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1}: Column count mismatch`);
      }

      const record: any = { row: i + 1 };
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // Validate required fields
      for (const field of requiredFields) {
        if (!record[field] || record[field].trim() === '') {
          throw new Error(`Row ${i + 1}: Missing value for ${field}`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        throw new Error(`Row ${i + 1}: Invalid email format`);
      }

      // Validate status
      if (!['active', 'completed'].includes(record.status)) {
        throw new Error(`Row ${i + 1}: Status must be 'active' or 'completed'`);
      }

      // Validate dates
      try {
        const startDate = formatDateForFirestore(record.startDate);
        const endDate = formatDateForFirestore(record.endDate);
        
        // Validate date format is YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(record.startDate) || !dateRegex.test(record.endDate)) {
          throw new Error(`Row ${i + 1}: Dates must be in YYYY-MM-DD format`);
        }

        if (endDate <= startDate) {
          throw new Error(`Row ${i + 1}: End date must be after start date`);
        }
      } catch (error: any) {
        throw new Error(`Row ${i + 1}: ${error.message}`);
      }

      records.push(record as CSVRecord);
    }

    return records;
  };

  const processImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);
    setResults([]);

    try {
      const csvText = await file.text();
      const records = parseCSV(csvText);

      if (records.length === 0) {
        throw new Error('No valid records found in CSV file');
      }

      if (records.length > 100) {
        throw new Error('Maximum 100 records allowed per import');
      }

      const processResults: ProcessResult[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        setProgress(Math.round((i / records.length) * 100));

        try {
          // Convert and validate dates
          const startDate = formatDateForFirestore(record.startDate);
          const endDate = formatDateForFirestore(record.endDate);

          const internData: InsertIntern = {
            fullName: record.fullName,
            email: record.email,
            domain: record.domain,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: record.status,
            createdBy: user.uid,
          };

          const certificateId = await addIntern(internData);
          
          processResults.push({
            success: true,
            certificateId,
            row: record.row,
            intern: record,
          });

        } catch (error: any) {
          processResults.push({
            success: false,
            error: error.message || 'Unknown error',
            row: record.row,
            intern: record,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setProgress(100);
      setResults(processResults);
      setShowResults(true);

      const successCount = processResults.filter(r => r.success).length;
      const failureCount = processResults.filter(r => !r.success).length;

      toast({
        title: "Import completed",
        description: `${successCount} records imported successfully, ${failureCount} failed`,
      });

    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const successfulImports = results.filter(r => r.success).length;
  const failedImports = results.filter(r => !r.success).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bulk Import Interns</h1>
            <p className="text-gray-600 mt-2">Import multiple intern records from a CSV file</p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            {/* Template Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Template
                </CardTitle>
                <CardDescription>
                  Download a CSV template with the required format and sample data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Upload your CSV file with intern data (max 100 records)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={importing}
                  />
                </div>

                {file && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={processImport}
                  disabled={!file || importing}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Interns
                    </>
                  )}
                </Button>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing records...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Format Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>CSV Format Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Required columns:</strong> fullName, email, domain, startDate, endDate, status</p>
                  <p><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-01-15)</p>
                  <p><strong>Status values:</strong> active or completed</p>
                  <p><strong>Email format:</strong> Valid email addresses only</p>
                  <p><strong>Limits:</strong> Maximum 100 records per import</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Import Results
                </CardTitle>
                <CardDescription>
                  Summary of the bulk import operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{successfulImports}</div>
                    <div className="text-sm text-green-800">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{failedImports}</div>
                    <div className="text-sm text-red-800">Failed</div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">
                            Row {result.row}: {result.intern.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.intern.email} - {result.intern.domain}
                          </div>
                          {result.success ? (
                            <div className="text-sm text-green-700">
                              Certificate ID: {result.certificateId}
                            </div>
                          ) : (
                            <div className="text-sm text-red-700">
                              Error: {result.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setFile(null);
                      setResults([]);
                      setProgress(0);
                    }}
                    variant="outline"
                  >
                    Import More
                  </Button>
                  <Button onClick={() => setLocation("/dashboard")}>
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}