
import { useState } from "react";
import PositionTrackingDashboard from "@/components/position-tracking/PositionTrackingDashboard";
import { usePositionTracking } from "@/hooks/usePositionTracking";

interface PositionTrackingTabContentProps {
  domain: string;
}

export const PositionTrackingTabContent = ({ domain }: PositionTrackingTabContentProps) => {
  // Initial set of keywords to track
  const defaultKeywords = [
    "revenue growth",
    "data analytics",
    "business intelligence",
    "pricing strategy",
    "market analysis"
  ];
  
  const {
    rankings,
    isLoading,
    error,
    visibilityScore,
    historyData,
    lastUpdated,
    fetchRankings
  } = usePositionTracking(domain, defaultKeywords);
  
  return (
    <div className="space-y-6">
      <PositionTrackingDashboard
        domain={domain}
        rankings={rankings}
        isLoading={isLoading}
        error={error}
        visibilityScore={visibilityScore}
        historyData={historyData}
        lastUpdated={lastUpdated}
        onTrackKeywords={fetchRankings}
      />
    </div>
  );
};

export default PositionTrackingTabContent;
