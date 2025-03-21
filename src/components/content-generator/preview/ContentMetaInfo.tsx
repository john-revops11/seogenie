
import React from "react";
import { Badge } from "@/components/ui/badge";
import { GeneratedContent } from "@/services/keywords/types";

interface ContentMetaInfoProps {
  generatedContent: GeneratedContent;
}

const ContentMetaInfo: React.FC<ContentMetaInfoProps> = ({ generatedContent }) => {
  return (
    <div className="bg-muted p-4 rounded-md mt-4">
      <h3 className="text-sm font-semibold mb-2">Content Information</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Content Type</p>
          <p className="text-sm">{generatedContent.contentType || 'Unknown'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">AI Model</p>
          <p className="text-sm">
            {generatedContent.aiProvider || 'Unknown'} / {generatedContent.aiModel || 'Unknown'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Generation Method</p>
          <p className="text-sm capitalize">{generatedContent.generationMethod || 'standard'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Keywords</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {generatedContent.keywords && generatedContent.keywords.length > 0 ? (
              generatedContent.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No keywords</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentMetaInfo;
