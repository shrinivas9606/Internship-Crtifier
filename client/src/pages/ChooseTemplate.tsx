import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { saveUserSettings } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { InsertUserSettings } from "@shared/schema";

interface ChooseTemplateProps {
  isEditMode?: boolean;
}

export default function ChooseTemplate({ isEditMode = false }: ChooseTemplateProps) {
  const [, setLocation] = useLocation();
  const { user, userSettings, signOut, refreshUserSettings } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: "",
    supervisorName: "",
    ceoName: "",
    selectedTemplate: "modern" as "classic" | "modern" | "elegant",
  });

  const [files, setFiles] = useState({
    companyLogo: null as File | null,
    supervisorSignature: null as File | null,
    ceoSignature: null as File | null,
  });

  const [uploading, setUploading] = useState(false);

  // Load existing settings when in edit mode
  useEffect(() => {
    if (isEditMode && userSettings) {
      setFormData({
        companyName: userSettings.companyName || "",
        supervisorName: userSettings.supervisorName || "",
        ceoName: userSettings.ceoName || "",
        selectedTemplate: userSettings.selectedTemplate || "modern",
      });
    }
  }, [isEditMode, userSettings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!formData.companyName || !formData.supervisorName || !formData.ceoName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In edit mode, files are optional (can keep existing ones)
    if (!isEditMode && (!files.companyLogo || !files.supervisorSignature || !files.ceoSignature)) {
      toast({
        title: "Error",
        description: "Please upload all required files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let logoUrl = userSettings?.companyLogo || "";
      let supervisorSigUrl = userSettings?.supervisorSignature || "";
      let ceoSigUrl = userSettings?.ceoSignature || "";

      // Only process files that were actually uploaded
      if (files.companyLogo) {
        logoUrl = await convertToDataUrl(files.companyLogo);
      }
      if (files.supervisorSignature) {
        supervisorSigUrl = await convertToDataUrl(files.supervisorSignature);
      }
      if (files.ceoSignature) {
        ceoSigUrl = await convertToDataUrl(files.ceoSignature);
      }

      const settings: InsertUserSettings = {
        uid: user.uid,
        companyName: formData.companyName,
        companyLogo: logoUrl,
        supervisorName: formData.supervisorName,
        supervisorSignature: supervisorSigUrl,
        ceoName: formData.ceoName,
        ceoSignature: ceoSigUrl,
        selectedTemplate: formData.selectedTemplate,
        setupCompleted: true,
      };

      await saveUserSettings(settings);
      await refreshUserSettings();

      toast({
        title: "Success",
        description: isEditMode 
          ? "Settings updated successfully" 
          : "Setup completed successfully",
      });

      setLocation("/dashboard");
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      let errorMessage = "Failed to save settings";
      if (error.code === 'permission-denied') {
        errorMessage = "Firestore permissions error. Please check your database rules.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const convertToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const FileUpload = ({ 
    label, 
    field, 
    accept = "image/*"
  }: { 
    label: string; 
    field: keyof typeof files; 
    accept?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          className="hidden"
          id={field}
        />
        <label htmlFor={field} className="cursor-pointer">
          {files[field] ? (
            <div>
              <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
              <p className="text-sm text-gray-600">{files[field]!.name}</p>
            </div>
          ) : isEditMode && userSettings?.[field === "companyLogo" ? "companyLogo" : 
                                        field === "supervisorSignature" ? "supervisorSignature" : 
                                        "ceoSignature"] ? (
            <div>
              <img 
                src={userSettings[field === "companyLogo" ? "companyLogo" : 
                                field === "supervisorSignature" ? "supervisorSignature" : 
                                "ceoSignature"]} 
                alt="Preview" 
                className="h-16 mx-auto mb-2 object-contain"
              />
              <p className="text-sm text-gray-600">Click to change</p>
            </div>
          ) : (
            <div>
              <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
              <p className="text-sm text-gray-600">Drop file here or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  const TemplateCard = ({ 
    id, 
    title, 
    description, 
    bgClass, 
    selected 
  }: { 
    id: "classic" | "modern" | "elegant";
    title: string;
    description: string;
    bgClass: string;
    selected: boolean;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        selected ? "border-2 border-primary-500 bg-primary-50" : "hover:border-primary-500"
      }`}
      onClick={() => handleInputChange("selectedTemplate", id)}
    >
      <div className={`aspect-w-4 aspect-h-3 ${bgClass} p-6`}>
        <div className="text-center">
          {id === "classic" && (
            <>
              <div className="text-xs font-semibold text-blue-600 mb-2">CERTIFICATE OF COMPLETION</div>
              <div className="h-1 w-16 bg-blue-600 mx-auto mb-3"></div>
              <div className="text-xs text-gray-600">This is to certify that</div>
              <div className="text-sm font-bold text-gray-800 my-2">[Intern Name]</div>
              <div className="text-xs text-gray-600">has successfully completed</div>
              <div className="text-xs font-semibold text-blue-600 mt-2">[Domain] Internship</div>
            </>
          )}
          {id === "modern" && (
            <>
              <div className="w-8 h-8 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-award text-white text-xs"></i>
              </div>
              <div className="text-xs font-bold text-purple-600">INTERNSHIP CERTIFICATE</div>
              <div className="text-sm font-bold text-gray-800 my-2">[Intern Name]</div>
              <div className="text-xs text-gray-600">Successfully completed internship in</div>
              <div className="text-xs font-semibold text-purple-600 mt-1">[Domain]</div>
            </>
          )}
          {id === "elegant" && (
            <>
              <div className="text-xs font-serif font-bold text-amber-700">Certificate of Achievement</div>
              <div className="flex justify-center my-2">
                <div className="w-12 h-0.5 bg-amber-600"></div>
              </div>
              <div className="text-xs text-gray-600">Presented to</div>
              <div className="text-sm font-serif font-bold text-gray-800 my-1">[Intern Name]</div>
              <div className="text-xs text-gray-600">for completing internship in</div>
              <div className="text-xs font-semibold text-amber-700">[Domain]</div>
            </>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          {title}
          {selected && (
            <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              Selected
            </span>
          )}
        </h4>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-certificate text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Certificate Generator</h1>
            </div>
            <Button variant="ghost" onClick={signOut}>
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Certificate Settings" : "Initial Setup"}
              </h2>
              {!isEditMode && (
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium text-sm">
                  Step 1 of 2
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <FileUpload label="Company Logo" field="companyLogo" />
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supervisorName">Supervisor Name</Label>
                    <Input
                      id="supervisorName"
                      value={formData.supervisorName}
                      onChange={(e) => handleInputChange("supervisorName", e.target.value)}
                      placeholder="Supervisor Name"
                    />
                  </div>
                  <FileUpload label="Supervisor Signature" field="supervisorSignature" />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ceoName">CEO Name</Label>
                    <Input
                      id="ceoName"
                      value={formData.ceoName}
                      onChange={(e) => handleInputChange("ceoName", e.target.value)}
                      placeholder="CEO Name"
                    />
                  </div>
                  <FileUpload label="CEO Signature" field="ceoSignature" />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Certificate Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TemplateCard
                  id="classic"
                  title="Classic Template"
                  description="Professional and timeless design"
                  bgClass="bg-gradient-to-br from-blue-50 to-indigo-100"
                  selected={formData.selectedTemplate === "classic"}
                />
                <TemplateCard
                  id="modern"
                  title="Modern Template"
                  description="Contemporary with clean aesthetics"
                  bgClass="bg-gradient-to-br from-purple-50 to-pink-100"
                  selected={formData.selectedTemplate === "modern"}
                />
                <TemplateCard
                  id="elegant"
                  title="Elegant Template"
                  description="Sophisticated with serif typography"
                  bgClass="bg-gradient-to-br from-amber-50 to-orange-100"
                  selected={formData.selectedTemplate === "elegant"}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={uploading}
                className="px-6"
              >
                {uploading 
                  ? isEditMode 
                    ? "Updating..." 
                    : "Setting up..."
                  : isEditMode 
                    ? "Update Settings" 
                    : "Complete Setup"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}