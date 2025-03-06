
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RotateCcw } from "lucide-react";

interface HeaderProps {
  analysisComplete: boolean;
  onReset: () => void;
}

export const Header = ({ analysisComplete, onReset }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Badge className="mb-2 bg-revology-light text-revology hover:bg-revology-light/80 transition-all">SEO Analysis Tool</Badge>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-revology">Revology Analytics</span>
          <span className="text-2xl font-normal text-muted-foreground">|</span>
          <span>SeoCrafter</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Keyword analysis and AI-driven content generation</p>
      </div>
      <div className="flex items-center gap-3">
        {analysisComplete && (
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data
          </Button>
        )}
        <Avatar className="w-12 h-12 border-2 border-revology">
          <AvatarImage src="https://ui.shadcn.com/avatars/01.png" />
          <AvatarFallback className="bg-revology-light text-revology">RA</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default Header;
