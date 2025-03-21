
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Star, Video, Image, Map, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RankingData } from "@/services/keywords/api/dataForSeo/positionTracking";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KeywordRankingsTableProps {
  rankings: RankingData[];
}

const KeywordRankingsTable: React.FC<KeywordRankingsTableProps> = ({ rankings }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"keyword" | "position" | "change">("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sort and filter rankings
  const sortedAndFilteredRankings = [...rankings]
    .filter(ranking => 
      ranking.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Handle sorting for different fields
      if (sortField === "keyword") {
        return sortDirection === "asc" 
          ? a.keyword.localeCompare(b.keyword)
          : b.keyword.localeCompare(a.keyword);
      }
      
      if (sortField === "position") {
        // Handle null positions (not ranking) - they should be at the bottom
        if (a.position === null && b.position === null) return 0;
        if (a.position === null) return sortDirection === "asc" ? 1 : -1;
        if (b.position === null) return sortDirection === "asc" ? -1 : 1;
        
        return sortDirection === "asc" 
          ? a.position - b.position 
          : b.position - a.position;
      }
      
      if (sortField === "change") {
        return sortDirection === "asc" 
          ? a.change - b.change
          : b.change - a.change;
      }
      
      return 0;
    });

  // Helper to handle column sort
  const handleSort = (field: "keyword" | "position" | "change") => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Helper to render position change indicator
  const renderPositionChange = (change: number) => {
    if (change > 0) {
      return (
        <Badge className="bg-green-500 flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{change}
        </Badge>
      );
    }
    if (change < 0) {
      return (
        <Badge className="bg-red-500 flex items-center">
          <TrendingDown className="h-3 w-3 mr-1" />
          {change}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center">
        <Minus className="h-3 w-3 mr-1" />
        0
      </Badge>
    );
  };

  // Helper to render SERP feature icons
  const renderSerpFeatures = (ranking: RankingData) => {
    return (
      <div className="flex space-x-1">
        <TooltipProvider>
          {ranking.hasFeaturedSnippet && (
            <Tooltip>
              <TooltipTrigger>
                <Star className="h-4 w-4 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent>Featured Snippet</TooltipContent>
            </Tooltip>
          )}
          
          {ranking.hasPaa && (
            <Tooltip>
              <TooltipTrigger>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>People Also Ask</TooltipContent>
            </Tooltip>
          )}
          
          {ranking.hasKnowledgePanel && (
            <Tooltip>
              <TooltipTrigger>
                <Star className="h-4 w-4 text-purple-500" />
              </TooltipTrigger>
              <TooltipContent>Knowledge Panel</TooltipContent>
            </Tooltip>
          )}
          
          {ranking.hasLocalPack && (
            <Tooltip>
              <TooltipTrigger>
                <Map className="h-4 w-4 text-green-500" />
              </TooltipTrigger>
              <TooltipContent>Local Pack</TooltipContent>
            </Tooltip>
          )}
          
          {ranking.hasVideo && (
            <Tooltip>
              <TooltipTrigger>
                <Video className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>Video</TooltipContent>
            </Tooltip>
          )}
          
          {ranking.hasImage && (
            <Tooltip>
              <TooltipTrigger>
                <Image className="h-4 w-4 text-teal-500" />
              </TooltipTrigger>
              <TooltipContent>Image</TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Rankings</CardTitle>
        <CardDescription>
          Current positions for your tracked keywords
        </CardDescription>
        <div className="mt-2">
          <Input
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("keyword")}>
                  Keyword
                  {sortField === "keyword" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />}
                    </span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("position")}>
                  Position
                  {sortField === "position" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />}
                    </span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("change")}>
                  Change
                  {sortField === "change" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />}
                    </span>
                  )}
                </TableHead>
                <TableHead>URL</TableHead>
                <TableHead>SERP Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredRankings.length > 0 ? (
                sortedAndFilteredRankings.map((ranking) => (
                  <TableRow key={ranking.keyword}>
                    <TableCell className="font-medium">{ranking.keyword}</TableCell>
                    <TableCell>
                      {ranking.position !== null ? (
                        <Badge 
                          className={
                            ranking.position <= 3 
                              ? "bg-green-500" 
                              : ranking.position <= 10 
                              ? "bg-blue-500"
                              : ranking.position <= 50
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }
                        >
                          {ranking.position}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Not Ranking</Badge>
                      )}
                    </TableCell>
                    <TableCell>{renderPositionChange(ranking.change)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {ranking.url ? (
                        <a 
                          href={ranking.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline truncate block"
                        >
                          {ranking.url}
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{renderSerpFeatures(ranking)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No keywords found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordRankingsTable;
