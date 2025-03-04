
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Search } from "lucide-react";
import { KeywordFilterProps } from "./types";

const KeywordFilter: React.FC<KeywordFilterProps> = ({
  searchQuery,
  setSearchQuery,
  intentFilter,
  setIntentFilter,
  uniqueIntents,
  isLoading,
  keywords,
  onExportCsv
}) => {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            className="pl-8 transition-all w-[200px] md:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="transition-all"
          onClick={onExportCsv}
          disabled={isLoading || keywords.length === 0}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      {keywords.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by intent:</span>
          </div>
          <Select value={intentFilter} onValueChange={setIntentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All intents</SelectItem>
              {uniqueIntents.map(intent => (
                <SelectItem key={intent} value={intent}>
                  {intent.charAt(0).toUpperCase() + intent.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default KeywordFilter;
