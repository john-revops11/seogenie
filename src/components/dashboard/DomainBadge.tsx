
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DomainBadgeProps {
  domain: string;
  apiCallsMade: boolean;
}

export function DomainBadge({ domain, apiCallsMade }: DomainBadgeProps) {
  if (!domain || !apiCallsMade) return null;
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 ml-2">
      <Globe className="h-3.5 w-3.5" />
      {domain}
    </Badge>
  );
}
