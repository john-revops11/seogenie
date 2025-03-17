
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
        return 'text-3xl font-bold mt-6 mb-4';
      case 'heading2':
        return 'text-2xl font-semibold mt-5 mb-3';
      case 'heading3':
        return 'text-xl font-medium mt-4 mb-2';
      case 'list':
        return 'mt-3 mb-4';
      case 'orderedList':
        return 'mt-3 mb-4';
      case 'paragraph':
        return 'mt-3 mb-4 leading-relaxed';
      case 'quote':
        return 'pl-4 border-l-4 border-gray-300 italic my-4';
      default:
        return 'mt-3 mb-4';
    }
  };

  // Process content to display it correctly based on block type
  const renderContent = () => {
    const blockClass = getBlockClasses();
    
    switch (block.type) {
      case 'list':
        // Check if content already contains HTML list tags
        if (block.content.includes('<ul>') || block.content.includes('<ol>')) {
          return (
            <div 
              className={blockClass}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        } else {
          // Convert text to proper HTML list if needed
          const listItems = block.content
            .split(/\n|•|-/)
            .filter(item => item.trim())
            .map((item, i) => `<li key=${i}>${item.trim()}</li>`)
            .join('');
          
          return (
            <div 
              className={blockClass}
              dangerouslySetInnerHTML={{ __html: `<ul>${listItems}</ul>` }}
            />
          );
        }
      
      case 'orderedList':
        // Check if content already contains HTML list tags
        if (block.content.includes('<ol>')) {
          return (
            <div 
              className={blockClass}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        } else {
          // Convert text to proper HTML ordered list if needed
          const listItems = block.content
            .split(/\n|\d+\./)
            .filter(item => item.trim())
            .map((item, i) => `<li key=${i}>${item.trim()}</li>`)
            .join('');
          
          return (
            <div 
              className={blockClass}
              dangerouslySetInnerHTML={{ __html: `<ol>${listItems}</ol>` }}
            />
          );
        }
      
      case 'quote':
        return (
          <blockquote className={blockClass}>
            {block.content.replace(/<\/?[^>]+(>|$)/g, "")}
          </blockquote>
        );
        
      default:
        return (
          <div 
            className={blockClass}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
    }
  };

  return renderContent();
};

export default ContentBlockRenderer;
