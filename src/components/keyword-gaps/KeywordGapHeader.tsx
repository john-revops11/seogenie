
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import KeywordGapDataSourceSelector from "./KeywordGapDataSourceSelector";
import { ApiSource } from "@/services/keywords/keywordGaps";

interface KeywordGapHeaderProps {
  competitorDomains: string[];
  selectedKeywordsCount: number;
  isLoading: boolean;
  apiSource: ApiSource;
  onApiSourceChange: (value: ApiSource) => void;
  locationCode: number;
  onLocationChange: (locationCode: number) => void;
}

export function KeywordGapHeader({
  competitorDomains,
  selectedKeywordsCount,
  isLoading,
  apiSource,
  onApiSourceChange,
  locationCode,
  onLocationChange
}: KeywordGapHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        Keyword Gaps 
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </CardTitle>
      <CardDescription>
        <div className="flex flex-col gap-2">
          <span>Keywords competitors rank for that you don't</span>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {competitorDomains.length} competitors analyzed
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {selectedKeywordsCount}/10 selected
            </div>
          </div>
          
          <KeywordGapDataSourceSelector 
            apiSource={apiSource}
            onApiSourceChange={onApiSourceChange}
            locationCode={locationCode}
            onLocationChange={onLocationChange}
          />
        </div>
      </CardDescription>
    </CardHeader>
  );
}

export default KeywordGapHeader;
