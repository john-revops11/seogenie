
import React from "react";

interface ContentMetadataProps {
  contentType: string;
  generationMethod: string;
  ragInfo?: {
    chunksRetrieved: number;
    relevanceScore: number;
  };
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({
  contentType,
  generationMethod,
  ragInfo
}) => {
  return (
    <div className="text-sm text-muted-foreground mb-4">
      <div>Content Type: {contentType}</div>
      <div>Generation Method: {generationMethod === 'rag' ? 'RAG-Enhanced' : 'Standard'}</div>
      {ragInfo && (
        <div>RAG Info: {ragInfo.chunksRetrieved} chunks retrieved (avg. score: {ragInfo.relevanceScore.toFixed(2)})</div>
      )}
    </div>
  );
};

export default ContentMetadata;
