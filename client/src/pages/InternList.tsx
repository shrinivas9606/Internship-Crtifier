import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getInternsByUser } from "@/lib/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Link } from "wouter";

type Intern = {
  id: string;
  fullName: string;
  domain: string;
  startDate: any;
  endDate: any;
  certificateId: string;
  createdBy: string;
  status: "active" | "completed";
  createdAt: any;
  email?: string;
};

const InternList = () => {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();

  const [interns, setInterns] = useState<Intern[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const internsPerPage = 5;

  // ✅ Redirect to "/" if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user]);

  // 🔁 Load Interns
  useEffect(() => {
    const fetchInterns = async () => {
      if (user?.uid) {
        try {
          const data = await getInternsByUser(user.uid);
          setInterns(data);
          setFilteredInterns(data);
        } catch (error) {
          console.error("Failed to load interns:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInterns();
  }, [user]);

  // 🔍 Filtering
  useEffect(() => {
    let results = interns;
    if (filterDomain !== "all") {
      results = results.filter(intern => intern.domain === filterDomain);
    }
    if (searchTerm.trim()) {
      results = results.filter(intern =>
        intern.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setCurrentPage(1);
    setFilteredInterns(results);
  }, [searchTerm, filterDomain, interns]);

  const domains = Array.from(new Set(interns.map(i => i.domain))).filter(Boolean);

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const formatDate = (date: any) =>
    date?.seconds ? new Date(date.seconds * 1000).toLocaleDateString() : date;

  const paginatedInterns = filteredInterns.slice(
    (currentPage - 1) * internsPerPage,
    currentPage * internsPerPage
  );

  const totalPages = Math.ceil(filteredInterns.length / internsPerPage);

  // ✅ Handle sign out and route reset
  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
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
              <h1 className="text-xl font-semibold text-gray-900">All Interns</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="ghost" onClick={handleSignOut}>
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-1/2"
            />
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="sm:w-1/3">
                <SelectValue placeholder="Filter by Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain, idx) => (
                  <SelectItem key={idx} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading interns...</div>
          ) : filteredInterns.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-certificate text-gray-300 text-4xl mb-4"></i>
              <p>No matching interns found.</p>
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  {paginatedInterns.map((intern) => (
                    <div
                      key={intern.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="font-medium text-primary-600 text-sm">
                            {getInitials(intern.fullName)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{intern.fullName}</h4>
                          <p className="text-sm text-gray-600">{intern.domain}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(intern.startDate)} → {formatDate(intern.endDate)}
                          </p>
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
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-gray-600 self-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternList;
