
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface GeneratedContentProps {
  generatedContent: {
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  };
  contentType: string;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ 
  generatedContent, 
  contentType 
}) => {
  const renderContent = () => {
    if (!generatedContent) return null;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Content Type: {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</h3>
          {contentType === "case-study" && (
            <p className="text-sm text-muted-foreground">
              Structure: Banner Title, Description, Situation, Obstacles, Action, Results
            </p>
          )}
          {contentType === "white-paper" && (
            <p className="text-sm text-muted-foreground">
              Structure: Header, Title, Table of Contents, Executive Summary, Introduction, Main Sections, Conclusion
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Outline</h3>
          <ul className="list-disc pl-5">
            {generatedContent.outline.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Content</h3>
          <div dangerouslySetInnerHTML={{ __html: generatedContent.content }} />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{generatedContent.title}</CardTitle>
        <CardDescription>{generatedContent.metaDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default GeneratedContent;
