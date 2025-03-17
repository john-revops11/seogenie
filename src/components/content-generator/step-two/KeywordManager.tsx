
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCw } from "lucide-react";

interface KeywordManagerProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onGenerateTopics: () => void;
}

const KeywordManager: React.FC<KeywordManagerProps> = ({
  keywords,
  onKeywordsChange,
  onGenerateTopics
}) => {
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      onKeywordsChange([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleClearKeywords = () => {
    onKeywordsChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="keywords">Keywords</Label>
          {keywords.length > 0 && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleClearKeywords}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear All Keywords
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Input
            id="keywords"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add keywords"
          />
          <Button type="button" onClick={handleAddKeyword} variant="secondary">
            Add
          </Button>
        </div>
        
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="px-2 py-1">
                {keyword}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordManager;
