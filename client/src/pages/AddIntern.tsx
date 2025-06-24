import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { addIntern } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { InsertIntern } from "@shared/schema";

export default function AddIntern() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    domain: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);

  const domains = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Data Science",
    "Digital Marketing",
    "Cybersecurity",
    "DevOps",
    "AI/ML",
    "Quality Assurance",
    "Product Management",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.round(diffDays / 30);
    
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.fullName || !formData.domain || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const internData: InsertIntern = {
        fullName: formData.fullName,
        email: formData.email || undefined,
        domain: formData.domain,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdBy: user.uid,
        status: "completed", // Assuming we're generating certificates for completed internships
      };

      const certificateId = await addIntern(internData);

      toast({
        title: "Success",
        description: "Certificate generated successfully",
      });

      setLocation(`/verify/${certificateId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/dashboard")}
                className="mr-4"
              >
                <i className="fas fa-arrow-left"></i>
              </Button>
              <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-certificate text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Add New Intern</h1>
            </div>
            <Button variant="ghost" onClick={signOut}>
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Intern Information</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the details to generate a certificate</p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter intern's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="intern@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Internship Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Internship Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Domain/Department *</Label>
                    <Select value={formData.domain} onValueChange={(value) => handleInputChange("domain", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="internId">Intern ID</Label>
                    <Input
                      id="internId"
                      value="Auto-generated"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Duration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={calculateDuration(formData.startDate, formData.endDate)}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>
              </div>

              {/* Certificate Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Preview</h3>
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="text-center text-sm text-gray-600">
                    <i className="fas fa-eye text-gray-400 text-2xl mb-2"></i>
                    <p>Certificate will be generated and displayed after form submission</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Certificate"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
