
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

  // Process content to properly format lists when rendered
  const processContent = (content: string): string => {
    if (block.type !== 'list') return content;
    
    // Ensure proper list formatting
    let processedContent = content;
    
    // If content contains a list but doesn't have proper list tags, add them
    if ((content.includes('<li>') || content.includes('1.') || content.includes('•')) && 
        !content.includes('<ul>') && !content.includes('<ol>')) {
      
      // Check if it's a numbered list or bullet list
      const isNumbered = /^\d+\./.test(content.trim());
      
      if (isNumbered) {
        // Convert text with numbers like "1. Item" to proper <ol> format
        processedContent = '<ol>' + 
          content.split(/\n/)
            .filter(line => line.trim().length > 0)
            .map(line => {
              // Extract just the content after the number
              const listItem = line.replace(/^\d+\.\s*/, '');
              return `<li>${listItem}</li>`;
            })
            .join('') + 
          '</ol>';
      } else {
        // Convert bullet points or regular text to <ul>
        processedContent = '<ul>' + 
          content.split(/\n/)
            .filter(line => line.trim().length > 0)
            .map(line => {
              // Remove bullet points if they exist
              const listItem = line.replace(/^[•\-*]\s*/, '');
              return `<li>${listItem}</li>`;
            })
            .join('') + 
          '</ul>';
      }
    }
    
    return processedContent;
  };

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: processContent(block.content) }} 
      className={getBlockClasses()}
    />
  );
};

export default ContentBlockRenderer;
