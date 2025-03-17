
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, ExternalLink, Link2, Search, TrendingUp, DollarSign } from "lucide-react";

interface DomainMetricsCardsProps {
  organicTraffic: number;
  organicKeywords: number;
  referringDomains: number | null;
  authorityScore: number | null;
  estimatedTrafficCost: number;
  isLoading: boolean;
}

export function DomainMetricsCards({
  organicTraffic,
  organicKeywords,
  referringDomains,
  authorityScore,
  estimatedTrafficCost,
  isLoading
}: DomainMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Authority Score</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {authorityScore !== null ? authorityScore.toFixed(0) : "N/A"}
              <span className="text-xs text-muted-foreground ml-1">/100</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Domain ranking score</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organic Traffic</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {organicTraffic.toLocaleString()}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Monthly visitors</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organic Keywords</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {organicKeywords.toLocaleString()}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Ranking keywords</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referring Domains</CardTitle>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {referringDomains !== null ? referringDomains.toLocaleString() : "N/A"}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Unique linking domains</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Traffic Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              ${estimatedTrafficCost.toLocaleString()}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Monthly SEO value</p>
        </CardContent>
      </Card>
    </div>
  );
}
