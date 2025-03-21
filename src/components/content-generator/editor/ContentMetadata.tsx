
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Tag, User } from "lucide-react";
import { GeneratedContent } from "@/services/keywords/types";

interface ContentMetadataProps {
  generatedContent: GeneratedContent;
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({ generatedContent }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{generatedContent.title}</h2>
            <p className="text-muted-foreground mt-1">{generatedContent.metaDescription}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {generatedContent.keywords?.map((keyword, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {keyword}
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Type: {generatedContent.contentType}</span>
            </div>
            
            {generatedContent.generationMethod && (
              <div className="flex items-center gap-1">
                <Badge variant={generatedContent.generationMethod === 'rag' ? 'default' : 'outline'}>
                  {generatedContent.generationMethod === 'rag' ? 'RAG Enhanced' : 'Standard Generation'}
                </Badge>
              </div>
            )}
            
            {generatedContent.aiModel && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Model: {generatedContent.aiModel}</span>
              </div>
            )}
            
            {generatedContent.wordCountOption && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Length: {generatedContent.wordCountOption}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentMetadata;
