// Import necessary modules and components
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";
import { BadgeVariant } from "./types";

// Define a type for the props that the component will receive
interface DataForSEODashboardProps {
  analysisData: DataForSEOAnalysisResult | null;
  domain: string;
}

// Create a custom Badge component that accepts the additional variants
const CustomBadge = ({ variant, children, className }: 
  { variant: BadgeVariant, children: React.ReactNode, className?: string }) => {
  
  // Map the custom variants to standard variants
  const mappedVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    if (variant === "success") return "default";  // Use default for success
    if (variant === "warning") return "secondary"; // Use secondary for warning
    if (variant === "outline" || variant === "destructive" || variant === "secondary") {
      return variant; // These are already valid
    }
    return "default"; // Default fallback
  };
  
  // Add specific classes based on the custom variant
  let customClass = className || "";
  if (variant === "success") customClass += " bg-green-500 hover:bg-green-700";
  if (variant === "warning") customClass += " bg-yellow-500 hover:bg-yellow-600";
  
  return (
    <Badge variant={mappedVariant()} className={customClass}>
      {children}
    </Badge>
  );
};

// Define the DataForSEODashboard component
const DataForSEODashboard: React.FC<DataForSEODashboardProps> = ({ analysisData, domain }) => {
  // Check if analysisData is null or undefined
  if (!analysisData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>DataForSEO Analysis Dashboard</CardTitle>
          <CardDescription>No data available. Please run an analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Waiting for data...</p>
        </CardContent>
      </Card>
    );
  }

  // Destructure the analysisData object
  const { serp, volume, traffic, competitors } = analysisData;

  // Render the component
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {/* SERP Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>SERP Results</CardTitle>
          <CardDescription>Analysis of search engine results page data</CardDescription>
        </CardHeader>
        <CardContent>
          {serp.success ? (
            <div className="space-y-2">
              {serp.results.map((result, index) => (
                <div key={index} className="border rounded-md p-2">
                  <p className="font-semibold">{result.keyword}</p>
                  <p>Position: {result.position}</p>
                  <p>
                    URL: <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{result.url}</a>
                  </p>
                  <CustomBadge 
                    variant={result.position && result.position <= 10 ? "success" : "warning"}
                    className="ml-2 px-2"
                  >
                    {result.position && result.position <= 10 ? "Top 10" : "Not Top 10"}
                  </CustomBadge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">Error: {serp.error || 'Failed to retrieve SERP results'}</p>
          )}
        </CardContent>
      </Card>

      {/* Volume Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Results</CardTitle>
          <CardDescription>Analysis of keyword search volume data</CardDescription>
        </CardHeader>
        <CardContent>
          {volume.success ? (
            <div className="space-y-2">
              {volume.results.map((result, index) => (
                <div key={index} className="border rounded-md p-2">
                  <p className="font-semibold">{result.keyword}</p>
                  <p>Search Volume: {result.search_volume}</p>
                  <p>CPC: {result.cpc}</p>
                  <p>Competition: {result.competition}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">Error: {volume.error || 'Failed to retrieve Volume results'}</p>
          )}
        </CardContent>
      </Card>

      {/* Traffic Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Results</CardTitle>
          <CardDescription>Analysis of website traffic data</CardDescription>
        </CardHeader>
        <CardContent>
          {traffic.success ? (
            <div className="space-y-2">
              <p>Organic Traffic: {traffic.results.organic_traffic}</p>
              <p>Paid Traffic: {traffic.results.paid_traffic}</p>
              <p>Total Traffic: {traffic.results.total_traffic}</p>
            </div>
          ) : (
            <p className="text-red-500">Error: {traffic.error || 'Failed to retrieve Traffic results'}</p>
          )}
        </CardContent>
      </Card>

      {/* Competitors Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Competitors Results</CardTitle>
          <CardDescription>Analysis of competitor data</CardDescription>
        </CardHeader>
        <CardContent>
          {competitors.success ? (
            <div className="space-y-2">
              {competitors.results.map((competitor, index) => (
                <div key={index} className="border rounded-md p-2">
                  <p className="font-semibold">{competitor.domain}</p>
                  <p>Score: {competitor.score}</p>
                  <p>Common Keywords: {competitor.common_keywords}</p>
                </div>
              ))}
              <CustomBadge 
                variant={
                  competitors.results.length === 0 
                    ? "destructive" 
                    : competitors.results.length > 3 
                      ? "success" 
                      : "warning"
                }
                className="ml-2"
              >
                {competitors.results.length === 0
                  ? "No Competitors Found"
                  : competitors.results.length > 3
                    ? "Many Competitors"
                    : "Few Competitors"}
              </CustomBadge>
            </div>
          ) : (
            <p className="text-red-500">Error: {competitors.error || 'Failed to retrieve Competitors results'}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataForSEODashboard;
