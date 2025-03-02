
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { ResearchKeyword } from "./types";
import { getDifficultyColor } from "./utils";

interface KeywordResultsTableProps {
  keywords: ResearchKeyword[];
  onGenerateContent: (keyword: string, relatedKeywords: string[]) => void;
}

const KeywordResultsTable = ({ keywords, onGenerateContent }: KeywordResultsTableProps) => {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead className="w-[100px] text-right">Volume</TableHead>
          <TableHead className="w-[100px] text-right">Difficulty</TableHead>
          <TableHead className="w-[100px] text-right">CPC ($)</TableHead>
          <TableHead className="w-[180px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((keyword, index) => (
          <TableRow key={index} className="group">
            <TableCell className="font-medium">
              {keyword.keyword}
              <div className="mt-1 flex flex-wrap gap-1">
                {keyword.relatedKeywords.map((related, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {related}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{keyword.recommendation}</p>
            </TableCell>
            <TableCell className="text-right">{keyword.volume.toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Badge className={getDifficultyColor(keyword.difficulty)}>
                {keyword.difficulty}
              </Badge>
            </TableCell>
            <TableCell className="text-right">${keyword.cpc.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                onClick={() => onGenerateContent(keyword.keyword, keyword.relatedKeywords)}
                className="opacity-80 group-hover:opacity-100 bg-revology hover:bg-revology-dark"
              >
                <Zap className="w-3 h-3 mr-1" />
                Generate Content
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KeywordResultsTable;
