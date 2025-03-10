
import React from "react";
import { ContentBlock } from "@/services/keywords/types";

interface ContentBlockRendererProps {
  block: ContentBlock;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ block }) => {
  // Add specific class names based on block type
  const getBlockClasses = () => {
    switch (block.type) {
      case 'heading1':
        return 'text-2xl font-bold mt-6 mb-3';
      case 'heading2':
        return 'text-xl font-bold mt-5 mb-2';
      case 'heading3':
        return 'text-lg font-bold mt-4 mb-2';
      case 'list':
        return 'mt-3 mb-4 list-content';
      case 'paragraph':
        return 'mt-3 mb-4 leading-relaxed';
      default:
        return 'mt-3 mb-4';
    }
  };

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: block.content }} 
      className={getBlockClasses()}
    />
  );
};

export default ContentBlockRenderer;
