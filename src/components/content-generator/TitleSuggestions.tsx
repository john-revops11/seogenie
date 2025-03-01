
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TitleSuggestionsProps {
  titles: string[];
  selectedTitle: string;
  onSelectTitle: (title: string) => void;
}

export const TitleSuggestions = ({ 
  titles, 
  selectedTitle, 
  onSelectTitle 
}: TitleSuggestionsProps) => {
  if (!titles || titles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 text-center">
        Select a topic to see title suggestions
      </div>
    );
  }

  return (
    <ScrollArea className="rounded-md border p-2 h-[180px]">
      <div className="space-y-2">
        {titles.map((title, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md hover:bg-accent transition-colors cursor-pointer ${
              selectedTitle === title ? 'bg-accent/80' : ''
            }`}
            onClick={() => onSelectTitle(title)}
          >
            <div className="flex justify-between items-start">
              <div className="font-medium text-sm">{title}</div>
              {selectedTitle === title && (
                <Badge variant="outline" className="ml-2 shrink-0 text-xs bg-revology/10 text-revology">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TitleSuggestions;
