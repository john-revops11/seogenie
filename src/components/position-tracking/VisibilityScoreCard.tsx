
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VisibilityScoreCardProps {
  score: number;
}

const VisibilityScoreCard: React.FC<VisibilityScoreCardProps> = ({ score }) => {
  // Determine the color based on the score
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };
  
  // Determine the score label
  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Poor";
    return "Very Poor";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Score</CardTitle>
        <CardDescription>
          How visible your site is in search results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${getScoreColor()}`}>
            {score}
          </div>
          <div className="text-lg mt-2">
            {getScoreLabel()}
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Based on keyword positions and search features
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisibilityScoreCard;
