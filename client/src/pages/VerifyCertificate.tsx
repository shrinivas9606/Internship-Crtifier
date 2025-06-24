import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { getInternByCertificateId } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CertificateTemplate } from "@/components/CertificateTemplate";
import type { Intern, UserSettings } from "@shared/schema";

export default function VerifyCertificate() {
  const [, params] = useRoute("/verify/:certificateId");
  const certificateId = params?.certificateId;
  
  const [data, setData] = useState<{ intern: Intern; userSettings: UserSettings } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCertificate = async () => {
      if (!certificateId) {
        setError("Certificate ID not provided");
        setLoading(false);
        return;
      }

      try {
        const result = await getInternByCertificateId(certificateId);
        if (result) {
          setData(result);
        } else {
          setError("Certificate not found or invalid");
        }
      } catch (error: any) {
        setError(error.message || "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, you would generate a PDF here
    // For now, we'll trigger the print dialog
    window.print();
  };

  const getVerificationUrl = () => {
    return window.location.href;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || "The certificate you're looking for doesn't exist or has been removed."}
            </p>
            <p className="text-sm text-gray-500">
              Certificate ID: {certificateId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { intern, userSettings } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-certificate text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Certificate Verification</h1>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <i className="fas fa-check-circle mr-1"></i>
              Verified
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {/* Certificate */}
        <Card className="shadow-lg print:shadow-none print:border-none">
          <CertificateTemplate
            ref={certificateRef}
            intern={intern}
            userSettings={userSettings}
            verificationUrl={getVerificationUrl()}
          />

          {/* Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-shield-alt text-green-500 mr-2"></i>
                <span>This certificate has been verified and is authentic</span>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={handleDownload}>
                  <i className="fas fa-download mr-2"></i>
                  Download PDF
                </Button>
                <Button onClick={handlePrint}>
                  <i className="fas fa-print mr-2"></i>
                  Print Certificate
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Verification Details */}
        <Card className="mt-8 print:hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Verification URL:</p>
                <p className="font-mono text-sm text-gray-800 break-all">{getVerificationUrl()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Verified:</p>
                <p className="font-semibold text-gray-800">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificate ID:</p>
                <p className="font-semibold text-gray-800">{intern.certificateId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificate Status:</p>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Valid & Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `
      }} />
    </div>
  );
}
