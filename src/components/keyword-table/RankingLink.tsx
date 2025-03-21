
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import { getRankingBadgeColor } from "./utils";

interface RankingLinkProps {
  url: string | null | undefined;
  position: number | null | undefined;
}

const RankingLink = ({ url, position }: RankingLinkProps) => {
  if (!url || !position) return <Badge variant="outline">-</Badge>;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1"
          >
            <Badge className={`${getRankingBadgeColor(position)}`}>
              {position} <ExternalLink className="ml-1 h-3 w-3" />
            </Badge>
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs truncate max-w-56">{url}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RankingLink;
