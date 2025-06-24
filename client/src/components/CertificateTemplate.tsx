import { forwardRef } from "react";
import QRCode from "react-qr-code";
import type { Intern, UserSettings } from "@shared/schema";

interface CertificateTemplateProps {
  intern: Intern;
  userSettings: UserSettings;
  verificationUrl: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ intern, userSettings, verificationUrl }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const calculateDuration = (startDate: string, endDate: string) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.round(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    };

    const getTemplateColor = () => {
      switch (userSettings.selectedTemplate) {
        case "classic": return "#2563eb";
        case "modern": return "#7c3aed";
        case "elegant": return "#d97706";
        default: return "#2563eb";
      }
    };

    const renderTemplate = () => {
      const commonElements = (
        <>
          {/* Company Logo and Header */}
          <div className="text-center mb-8">
            <img 
              src={userSettings.companyLogo} 
              alt="Company Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800">{userSettings.companyName}</h1>
          </div>

          {/* Certificate Content */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4">This is to certify that</p>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">{intern.fullName}</h4>
            <p className="text-gray-700 mb-2">has successfully completed the internship program in</p>
            <h5 className="text-2xl font-semibold mb-6" style={{ color: getTemplateColor() }}>
              {intern.domain}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
              <div>
                <p className="text-sm text-gray-600">Duration:</p>
                <p className="font-semibold text-gray-800">
                  {calculateDuration(intern.startDate, intern.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Period:</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(intern.startDate)} - {formatDate(intern.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificate ID:</p>
                <p className="font-semibold text-gray-800">{intern.certificateId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Issue Date:</p>
                <p className="font-semibold text-gray-800">{formatDate(intern.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <img 
                src={userSettings.supervisorSignature} 
                alt="Supervisor Signature" 
                className="h-16 mx-auto mb-2 object-contain"
              />
              <div className="border-t border-gray-400 pt-2">
                <p className="font-semibold text-gray-800">{userSettings.supervisorName}</p>
                <p className="text-sm text-gray-600">Program Supervisor</p>
              </div>
            </div>
            <div className="text-center">
              <img 
                src={userSettings.ceoSignature} 
                alt="CEO Signature" 
                className="h-16 mx-auto mb-2 object-contain"
              />
              <div className="border-t border-gray-400 pt-2">
                <p className="font-semibold text-gray-800">{userSettings.ceoName}</p>
                <p className="text-sm text-gray-600">Chief Executive Officer</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mt-8">
            <div className="inline-block p-4 bg-gray-100 rounded-lg">
              <QRCode value={verificationUrl} size={96} />
              <p className="text-xs text-gray-600 mt-2">Scan to verify</p>
            </div>
          </div>
        </>
      );

      switch (userSettings.selectedTemplate) {
        case "classic":
          return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 md:p-12">
              <div className="bg-white rounded-lg p-8 md:p-12 shadow-xl">
                <div className="text-center mb-8">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                    CERTIFICATE OF COMPLETION
                  </div>
                  <div className="h-1 w-16 bg-blue-600 mx-auto"></div>
                </div>
                {commonElements}
              </div>
            </div>
          );

        case "modern":
          return (
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-8 md:p-12">
              <div className="bg-white rounded-lg p-8 md:p-12 shadow-xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="fas fa-award text-white text-2xl"></i>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-purple-700 mb-2">
                    INTERNSHIP CERTIFICATE
                  </div>
                </div>
                {commonElements}
              </div>
            </div>
          );

        case "elegant":
          return (
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-8 md:p-12">
              <div className="bg-white rounded-lg p-8 md:p-12 shadow-xl">
                <div className="text-center mb-8">
                  <div className="text-2xl md:text-3xl font-serif font-bold text-amber-700 mb-2">
                    Certificate of Achievement
                  </div>
                  <div className="w-24 h-0.5 bg-amber-600 mx-auto"></div>
                </div>
                {commonElements}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div ref={ref} className="print:shadow-none">
        {renderTemplate()}
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";
