
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Link2, 
  Image as ImageIcon,
  Clock,
  Search
} from "lucide-react";

// Mock data for demonstration purposes
const seoIssues = [
  { 
    type: "critical", 
    issues: [
      { name: "Missing meta descriptions", count: 12, urls: ["/blog/pricing-strategy", "/services/consulting"] },
      { name: "Duplicate title tags", count: 5, urls: ["/blog/revenue-growth", "/blog/pricing-models"] },
    ] 
  },
  { 
    type: "warning", 
    issues: [
      { name: "Low word count (< 300 words)", count: 8, urls: ["/blog/case-studies", "/about"] },
      { name: "Missing alt text on images", count: 15, urls: ["/blog/pricing-strategy", "/case-studies/enterprise"] },
      { name: "Slow page load (> 3s)", count: 7, urls: ["/resources", "/contact"] },
    ] 
  },
  { 
    type: "passed", 
    issues: [
      { name: "Mobile friendly", count: 42, urls: [] },
      { name: "Valid schema markup", count: 18, urls: [] },
      { name: "Good keyword usage", count: 35, urls: [] },
    ] 
  },
];

const ContentSeoAuditCard = () => {
  const [selectedIssueType, setSelectedIssueType] = useState<string>("critical");
  
  // Calculate total issues
  const totalIssues = seoIssues.reduce((acc, group) => {
    return acc + group.issues.reduce((sum, issue) => sum + (group.type !== "passed" ? issue.count : 0), 0);
  }, 0);
  
  // Calculate SEO health score
  const totalChecks = seoIssues.reduce((acc, group) => {
    return acc + group.issues.reduce((sum, issue) => sum + issue.count, 0);
  }, 0);
  
  const criticalIssues = seoIssues.find(group => group.type === "critical")?.issues.reduce((sum, issue) => sum + issue.count, 0) || 0;
  const warningIssues = seoIssues.find(group => group.type === "warning")?.issues.reduce((sum, issue) => sum + issue.count, 0) || 0;
  
  const seoHealthScore = Math.round(((totalChecks - (criticalIssues * 2 + warningIssues)) / totalChecks) * 100);
  
  // Get color based on score
  const getHealthColor = (score: number) => {
    if (score < 50) return "text-red-500";
    if (score < 80) return "text-amber-500";
    return "text-green-500";
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content SEO Audit</CardTitle>
        <CardDescription>Analyze your content for SEO improvements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800">Critical Issues</h3>
              <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800">Warnings</h3>
              <p className="text-2xl font-bold text-amber-600">{warningIssues}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800">SEO Health</h3>
              <p className={`text-2xl font-bold ${getHealthColor(seoHealthScore)}`}>{seoHealthScore}%</p>
            </div>
            <div className="w-12 h-12 relative">
              <svg className="w-12 h-12" viewBox="0 0 36 36">
                <path
                  className="stroke-green-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  className={`${getHealthColor(seoHealthScore)}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${seoHealthScore}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={selectedIssueType === "critical" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedIssueType("critical")}
            className="flex items-center"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Critical
          </Button>
          <Button 
            variant={selectedIssueType === "warning" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedIssueType("warning")}
            className="flex items-center"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warnings
          </Button>
          <Button 
            variant={selectedIssueType === "passed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedIssueType("passed")}
            className="flex items-center"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Passed
          </Button>
        </div>
        
        <div className="space-y-4">
          {seoIssues
            .find(group => group.type === selectedIssueType)?.issues
            .map((issue, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {selectedIssueType === "critical" && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    {selectedIssueType === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />}
                    {selectedIssueType === "passed" && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                    <span className="font-medium">{issue.name}</span>
                  </div>
                  <Badge variant={selectedIssueType === "passed" ? "outline" : "secondary"}>
                    {issue.count} {selectedIssueType === "passed" ? "pages" : "issues"}
                  </Badge>
                </div>
                
                {issue.urls.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <Separator />
                    <div className="pt-2">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Affected URLs:</h4>
                      <div className="space-y-1">
                        {issue.urls.map((url, i) => (
                          <div key={i} className="text-xs bg-gray-50 p-2 rounded flex items-center">
                            <Link2 className="h-3 w-3 mr-2 text-gray-400" />
                            {url}
                          </div>
                        ))}
                        {issue.urls.length > 2 && (
                          <div className="text-xs text-center text-muted-foreground mt-1">
                            + {issue.count - issue.urls.length} more affected pages
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentSeoAuditCard;
