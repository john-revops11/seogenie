
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DomainIntersectionForm } from "./DomainIntersectionForm";
import { IntersectionResultsTable } from "./IntersectionResultsTable";
import { IntersectionError } from "./IntersectionError";
import { IntersectionLoading } from "./IntersectionLoading";
import { IntersectionEmptyState } from "./IntersectionEmptyState";
import { useDomainIntersection } from "@/hooks/useDomainIntersection";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DomainIntersectionCardProps {
  domain: string;
  onMetricsLoaded?: (metrics: {
    organicTraffic: number;
    organicKeywords: number;
    trafficValue: number;
  }) => void;
}

export function DomainIntersectionCard({ domain, onMetricsLoaded }: DomainIntersectionCardProps) {
  const [targetDomain, setTargetDomain] = useState(domain);
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  
  const {
    intersectionData,
    totalKeywords,
    isLoading,
    error,
    lastUpdated,
    domains,
    fetchIntersectionData,
    resetData
  } = useDomainIntersection();

  const handleCompare = () => {
    if (targetDomain && competitorDomain) {
      setOpenDialog(true);
    }
  };

  const confirmAnalysis = () => {
    fetchIntersectionData(targetDomain, competitorDomain);
    setOpenDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Domain Intersection Analysis</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Compare your domain with a competitor to see common ranking keywords. This uses the DataForSEO API and counts against your API quota.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!isLoading && intersectionData.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {intersectionData.length} shared keywords
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DomainIntersectionForm
            targetDomain={targetDomain}
            competitorDomain={competitorDomain}
            setTargetDomain={setTargetDomain}
            setCompetitorDomain={setCompetitorDomain}
            handleCompare={handleCompare}
            isLoading={isLoading}
            resetData={resetData}
            intersectionDataExists={intersectionData.length > 0}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            confirmAnalysis={confirmAnalysis}
          />

          {error ? (
            <IntersectionError error={error} />
          ) : isLoading ? (
            <IntersectionLoading targetDomain={targetDomain} competitorDomain={competitorDomain} />
          ) : intersectionData.length > 0 ? (
            <IntersectionResultsTable
              intersectionData={intersectionData}
              domains={domains}
              lastUpdated={lastUpdated}
            />
          ) : lastUpdated ? (
            <div className="text-center py-8 text-muted-foreground">
              No intersection data found between these domains
            </div>
          ) : (
            <IntersectionEmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
