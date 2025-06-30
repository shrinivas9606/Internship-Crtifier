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
    // Format date for display (handles Firestore Timestamp, Date object, or ISO string)

    // Update the formatDate function in CertificateTemplate.tsx
const formatDate = (date: Date | string | { seconds: number }): string => {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if ('seconds' in date) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // Format as YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

    // Calculate duration between two dates
    const calculateDuration = (start: Date | string | { seconds: number }, end: Date | string | { seconds: number }): string => {
      const startDate = typeof start === 'string' ? new Date(start) : 
                       'seconds' in start ? new Date(start.seconds * 1000) : start;
      const endDate = typeof end === 'string' ? new Date(end) : 
                     'seconds' in end ? new Date(end.seconds * 1000) : end;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "Invalid duration";
      }
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      
      if (months <= 0) {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return `${days} day${days !== 1 ? 's' : ''}`;
      }

      return `${months} month${months !== 1 ? 's' : ''}`;
    };

    // Get template-specific color scheme
    const getTemplateColor = () => {
      switch (userSettings.selectedTemplate) {
        case "classic": return "#2563eb";
        case "modern": return "#7c3aed";
        case "elegant": return "#d97706";
        default: return "#2563eb";
      }
    };

    // Common elements for all templates
    const commonElements = (
      <>
        {/* Company Logo and Header */}
        <div className="text-center mb-8">
          {userSettings.companyLogo && (
            <img 
              src={userSettings.companyLogo} 
              alt="Company Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
          )}
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
          
          {/* Internship Details */}
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
            {userSettings.supervisorSignature && (
              <img 
                src={userSettings.supervisorSignature} 
                alt="Supervisor Signature" 
                className="h-16 mx-auto mb-2 object-contain"
              />
            )}
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold text-gray-800">{userSettings.supervisorName}</p>
              <p className="text-sm text-gray-600">Program Supervisor</p>
            </div>
          </div>
          <div className="text-center">
            {userSettings.ceoSignature && (
              <img 
                src={userSettings.ceoSignature} 
                alt="CEO Signature" 
                className="h-16 mx-auto mb-2 object-contain"
              />
            )}
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold text-gray-800">{userSettings.ceoName}</p>
              <p className="text-sm text-gray-600">Chief Executive Officer</p>
            </div>
          </div>
        </div>

        {/* QR Code for Verification */}
        <div className="text-center mt-8">
          <div className="inline-block p-4 bg-gray-100 rounded-lg">
            <QRCode 
              value={verificationUrl} 
              size={96}
              bgColor="transparent"
              fgColor="#000000"
            />
            <p className="text-xs text-gray-600 mt-2">Scan to verify</p>
          </div>
        </div>
      </>
    );

    // Render different templates based on user selection
    const renderTemplate = () => {
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
                    Certificate of Completion
                  </div>
                  <div className="w-24 h-0.5 bg-amber-600 mx-auto"></div>
                </div>
                {commonElements}
              </div>
            </div>
          );

        default:
          return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 md:p-12">
              <div className="bg-white rounded-lg p-8 md:p-12 shadow-xl">
                {commonElements}
              </div>
            </div>
          );
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