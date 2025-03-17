
import React from "react";
import { GeneratedContent } from "@/services/keywords/types";

interface ContentMetadataProps {
  generatedContent: GeneratedContent;
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({ generatedContent }) => {
  return (
    <div className="text-sm text-muted-foreground mb-4">
      <div>Title: {generatedContent.title}</div>
      <div>Meta Description: {generatedContent.metaDescription}</div>
      <div>Content Type: {generatedContent.contentType}</div>
      <div>Generation Method: {generatedContent.generationMethod === 'rag' ? 'RAG-Enhanced' : 'Standard'}</div>
      {generatedContent.ragInfo && (
        <div>
          RAG Info: {generatedContent.ragInfo.chunksRetrieved} chunks retrieved 
          (avg. score: {generatedContent.ragInfo.relevanceScore.toFixed(2)})
        </div>
      )}
      {generatedContent.keywords && (
        <div>Keywords: {generatedContent.keywords.join(', ')}</div>
      )}
    </div>
  );
};

export default ContentMetadata;
