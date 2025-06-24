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
              <h3 className="font-semibold text-green-900 mb-2">Step 2: Enable Authentication (REQUIRED)</h3>
              <div className="bg-red-100 border border-red-300 rounded p-2 mb-3">
                <p className="text-red-800 text-sm font-medium">⚠️ This step is mandatory - the app won't work without it!</p>
              </div>
              <ol className="text-sm text-green-800 space-y-2">
                <li><strong>1.</strong> Go to Authentication → Sign-in method</li>
                <li><strong>2.</strong> Click on "Email/Password" and toggle "Enable" ON</li>
                <li><strong>3.</strong> Click on "Google" and toggle "Enable" ON (add your email as test user)</li>
                <li><strong>4.</strong> Add authorized domain:</li>
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
              <h3 className="font-semibold text-yellow-900 mb-2">Step 4: Enable Firestore Database</h3>
              <ol className="text-sm text-yellow-800 space-y-1">
                <li>1. Go to Firestore Database in Firebase Console</li>
                <li>2. Click "Create database"</li>
                <li>3. Choose "Start in test mode" (for development)</li>
                <li>4. Select your preferred location</li>
              </ol>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Step 5: Enable Firebase Storage</h3>
              <ol className="text-sm text-orange-800 space-y-1">
                <li>1. Go to Storage in Firebase Console</li>
                <li>2. Click "Get started"</li>
                <li>3. Choose "Start in test mode"</li>
                <li>4. Select same location as Firestore</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Setup Checklist</h3>
              <p className="text-sm text-gray-800">
                ✅ Firebase keys are configured<br/>
                ❌ Authentication providers need to be enabled<br/>
                ❌ Firestore database needs to be created<br/>
                ❌ Firebase Storage needs to be enabled
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