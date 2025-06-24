import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FirebaseSetup() {
  const devUrl = "https://workspace.B44ShrinivasNar.repl.co";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-cog text-white text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Firebase Setup Required</h2>
            <p className="mt-2 text-sm text-gray-600">Configure Firebase to enable authentication and data storage</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Step 1: Create Firebase Project</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to <a href="https://console.firebase.google.com/" target="_blank" className="underline">Firebase Console</a></li>
                <li>2. Click "Create a project" and follow the setup</li>
                <li>3. Add a web app (click the &lt;/&gt; icon)</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Step 2: Enable Authentication</h3>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. Go to Authentication → Sign-in method</li>
                <li>2. Enable "Email/Password" and "Google" providers</li>
                <li>3. Add authorized domain:</li>
              </ol>
              <div className="mt-2 flex items-center space-x-2">
                <code className="bg-white px-2 py-1 rounded text-xs font-mono">{devUrl.replace('https://', '')}</code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyToClipboard(devUrl.replace('https://', ''))}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Step 3: Get Configuration Keys</h3>
              <p className="text-sm text-purple-800 mb-2">
                In your Firebase project settings, copy these three values:
              </p>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• <strong>API Key</strong> (VITE_FIREBASE_API_KEY)</li>
                <li>• <strong>App ID</strong> (VITE_FIREBASE_APP_ID)</li>
                <li>• <strong>Project ID</strong> (VITE_FIREBASE_PROJECT_ID)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Step 4: Add Keys to Replit</h3>
              <p className="text-sm text-yellow-800">
                Add the three configuration values as secrets in your Replit environment. 
                The app will automatically reload once the keys are configured.
              </p>
            </div>

            <div className="text-center pt-4">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                <i className="fas fa-refresh mr-2"></i>
                Refresh Page After Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}