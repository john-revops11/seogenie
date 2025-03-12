
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

interface TitleSuggestionsProps {
  title: string;
  suggestedTitles: string[];
  isLoading: boolean;
  onTitleChange: (title: string) => void;
  onGenerateTitles: () => void;
}

const TitleSuggestions: React.FC<TitleSuggestionsProps> = ({
  title,
  suggestedTitles,
  isLoading,
  onTitleChange,
  onGenerateTitles,
}) => {
  return (
    <div className="space-y-2 mt-6">
      <div className="flex justify-between items-center">
        <Label htmlFor="title">Title</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onGenerateTitles}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Title Ideas
            </>
          )}
        </Button>
      </div>
      <Input
        id="title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Enter your content title"
      />

      {suggestedTitles.length > 0 && (
        <div className="space-y-2 bg-muted/40 p-3 rounded-md">
          <Label>Title Suggestions</Label>
          <div className="space-y-2">
            {suggestedTitles.map((suggestedTitle, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                onClick={() => onTitleChange(suggestedTitle)}
              >
                <span>{suggestedTitle}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTitleChange(suggestedTitle);
                  }}
                >
                  Use
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleSuggestions;
