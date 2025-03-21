
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useRankedKeywords } from "@/hooks/useRankedKeywords";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RankedKeywordsTable = () => {
  const [domain, setDomain] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { keywords, isLoading, error, lastUpdated, fetchRankedKeywords } = useRankedKeywords();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      setOpenDialog(true);
    }
  };

  const handleConfirmFetch = () => {
    fetchRankedKeywords(domain);
    setOpenDialog(false);
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (position <= 10) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    if (position <= 20) return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ranked Keywords</CardTitle>
        <CardDescription>
          View all keywords where your domain ranks in Google search results
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mb-6">
          <Input
            placeholder="Enter domain (e.g., example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button type="submit" disabled={isLoading || !domain.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </form>
        
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm API Request</AlertDialogTitle>
              <AlertDialogDescription>
                This will make an API call to DataForSEO to fetch ranked keywords for {domain}.
                Each request counts against your API quota. Do you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmFetch}>
                Proceed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Fetching ranked keywords for {domain}...</p>
            </div>
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : keywords.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-medium">Found {keywords.length} ranked keywords</h3>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
                )}
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="w-24 text-center">Position</TableHead>
                  <TableHead className="w-32 text-right">Volume</TableHead>
                  <TableHead className="w-24 text-right">CPC</TableHead>
                  <TableHead className="w-32 text-right">Traffic Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {keyword.keyword}
                      {keyword.is_featured_snippet && (
                        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getPositionColor(keyword.position)}>
                        {keyword.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{keyword.search_volume.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${keyword.cpc.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${keyword.traffic_cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : lastUpdated ? (
          <div className="text-center py-8 text-muted-foreground">
            No ranked keywords found for this domain
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default RankedKeywordsTable;
