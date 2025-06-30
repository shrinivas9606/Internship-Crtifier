import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardStats, getInternsByUser } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Intern } from "@shared/schema";
import { Plus, Upload } from "lucide-react";

export default function Dashboard() {
  const { user, userSettings, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const [stats, setStats] = useState({
    totalInterns: 0,
    generatedCerts: 0,
    verifications: 0,
    activeInternships: 0,
  });
  const [recentInterns, setRecentInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [dashboardStats, interns] = await Promise.all([
          getDashboardStats(user.uid),
          getInternsByUser(user.uid),
        ]);

        setStats(dashboardStats);
        setRecentInterns(interns.slice(0, 5)); // Show only recent 5
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);

        if (error.code === "failed-precondition") {
          setStats({
            totalInterns: 0,
            generatedCerts: 0,
            verifications: 0,
            activeInternships: 0,
          });
          setRecentInterns([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: any) =>
  date?.seconds ? new Date(date.seconds * 1000).toLocaleDateString() : date;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="ghost" onClick={async () => {await signOut();setLocation("/");}}>
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats.totalInterns === 0 && stats.generatedCerts === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
                <i className="fas fa-info-circle"></i>
              </div>
              <div>
                <h3 className="text-blue-900 font-medium">Complete Firebase Setup</h3>
                <p className="text-blue-800 text-sm">
                  To see your data, please complete Firebase setup:
                  <br />1. Enable Firestore Database in test mode
                  <br />2. Enable Authentication (Email/Password + Google)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Interns", value: stats.totalInterns, icon: "users", color: "blue" },
            { label: "Generated Certificates", value: stats.generatedCerts, icon: "certificate", color: "green" },
            { label: "Verifications", value: stats.verifications, icon: "eye", color: "purple" },
            { label: "Active Internships", value: stats.activeInternships, icon: "clock", color: "yellow" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                    <i className={`fas fa-${stat.icon} text-${stat.color}-600`}></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="default" onClick={() => setLocation("/add-intern")}>
                    <Plus className="h-4 w-4 mr-2" /> Add New Intern
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setLocation("/bulk-import")}>
                    <Upload className="h-4 w-4 mr-2" /> Bulk Import CSV
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setLocation("/edit-template")}>
                    <i className="fas fa-cog mr-2"></i> Template Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Certificates</h3>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/intern-list")}>View All</Button>
                </div>
              </div>
              <CardContent className="p-6">
                {recentInterns.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-certificate text-gray-300 text-4xl mb-4"></i>
                    <p>No certificates generated yet</p>
                    <p className="text-sm">
                      {stats.totalInterns === 0 && stats.generatedCerts === 0 ?
                        "Complete Firebase setup and add your first intern to get started" :
                        "Add your first intern to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentInterns.map((intern) => (
                      <div key={intern.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <span className="font-medium text-primary-600 text-sm">{getInitials(intern.fullName)}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{intern.fullName}</h4>
                            <p className="text-sm text-gray-600">{intern.domain}</p>
                            <p className="text-xs text-gray-500">{formatDate(intern.startDate)} → {formatDate(intern.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={intern.status === "completed" ? "default" : "secondary"}>{intern.status === "completed" ? "Completed" : "In Progress"}</Badge>
                          <Link href={`/verify/${intern.certificateId}`}>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-external-link-alt"></i>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
