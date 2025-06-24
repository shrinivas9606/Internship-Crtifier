import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardStats, getInternsByUser } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Intern } from "@shared/schema";

export default function Dashboard() {
  const { user, signOut } = useAuth();
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
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <Button variant="ghost" onClick={signOut}>
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Interns</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalInterns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <i className="fas fa-certificate text-green-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Generated Certificates</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.generatedCerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-eye text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Verifications</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.verifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <i className="fas fa-clock text-yellow-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Internships</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeInternships}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/add-intern">
                    <Button className="w-full justify-between" variant="default">
                      <div className="flex items-center">
                        <i className="fas fa-user-plus mr-3"></i>
                        <span>Add New Intern</span>
                      </div>
                      <i className="fas fa-arrow-right"></i>
                    </Button>
                  </Link>

                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center">
                      <i className="fas fa-download mr-3"></i>
                      <span>Bulk Export</span>
                    </div>
                    <i className="fas fa-arrow-right"></i>
                  </Button>

                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center">
                      <i className="fas fa-cog mr-3"></i>
                      <span>Template Settings</span>
                    </div>
                    <i className="fas fa-arrow-right"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Certificates */}
          <div className="lg:col-span-2">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Certificates</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </div>

              <CardContent className="p-6">
                {recentInterns.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-certificate text-gray-300 text-4xl mb-4"></i>
                    <p>No certificates generated yet</p>
                    <p className="text-sm">Add your first intern to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentInterns.map((intern) => (
                      <div key={intern.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <span className="font-medium text-primary-600 text-sm">
                              {getInitials(intern.fullName)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{intern.fullName}</h4>
                            <p className="text-sm text-gray-600">{intern.domain}</p>
                            <p className="text-xs text-gray-500">Generated {formatDate(intern.createdAt.toString())}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={intern.status === "completed" ? "default" : "secondary"}>
                            {intern.status === "completed" ? "Completed" : "In Progress"}
                          </Badge>
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
