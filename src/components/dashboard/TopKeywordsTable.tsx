
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TopKeyword {
  keyword: string;
  position: number;
  search_volume: number;
  cpc: number;
}

interface TopKeywordsTableProps {
  keywords: TopKeyword[];
  isLoading: boolean;
}

export function TopKeywordsTable({ keywords, isLoading }: TopKeywordsTableProps) {
  const getPositionColor = (position: number) => {
    if (position <= 3) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (position <= 10) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    if (position <= 20) return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Ranking Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : keywords.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No keyword data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead className="w-24 text-center">Position</TableHead>
                <TableHead className="w-32 text-right">Volume</TableHead>
                <TableHead className="w-24 text-right">CPC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((keyword, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={getPositionColor(keyword.position)}>
                      {keyword.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{keyword.search_volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${keyword.cpc.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
