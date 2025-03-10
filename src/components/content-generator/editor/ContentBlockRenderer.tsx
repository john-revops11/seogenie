
import React from "react";
import { ContentBlock } from "@/services/keywords/types";

interface ContentBlockRendererProps {
  block: ContentBlock;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ block }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: block.content }} 
      className={
        block.type === 'heading1' ? 'text-2xl font-bold mt-4 mb-2' :
        block.type === 'heading2' ? 'text-xl font-bold mt-4 mb-2' :
        block.type === 'heading3' ? 'text-lg font-bold mt-3 mb-2' :
        block.type === 'list' ? 'mt-2 mb-2 pl-5 space-y-1 list-content' :
        'mt-2 mb-2'
      }
    />
  );
};

export default ContentBlockRenderer;
