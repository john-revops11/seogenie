
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DatabaseIcon, DollarSign } from "lucide-react";
import { getDataForSEOUsageCost } from "@/services/keywords/api/dataForSeo/dataForSeoClient";
import { supabase } from "@/integrations/supabase/client";

export const DataForSeoUsageCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<{ totalCost: number; requestCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setIsLoading(false);
          return;
        }
        
        const data = await getDataForSEOUsageCost(user.id);
        setUsageData(data);
      } catch (err) {
        console.error("Error fetching usage data:", err);
        setError("Failed to load usage data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsageData();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          <span>DataForSEO API Usage</span>
        </CardTitle>
        <CardDescription>
          Track your DataForSEO API usage and estimated costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground py-2">
            {error === "Not authenticated" 
              ? "Please log in to view your API usage data" 
              : "Failed to load usage data. Please try again later."}
          </p>
        ) : !usageData ? (
          <p className="text-sm text-muted-foreground py-2">
            No usage data found. This will update as you make API requests.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Requests</p>
                <p className="text-2xl font-bold">{usageData.requestCount.toLocaleString()}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">Estimated Cost</p>
                <p className="text-2xl font-bold flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {usageData.totalCost.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Note: This is an estimated cost based on DataForSEO's pricing model.</p>
              <p>Actual costs may vary depending on the specific API usage.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataForSeoUsageCard;
