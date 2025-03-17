
import React from "react";
import { ContentBlock } from "@/services/keywords/types";
import { Badge } from "@/components/ui/badge";

interface ContentBlockRendererProps {
  block: ContentBlock;
  showBadge?: boolean;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ 
  block,
  showBadge = false
}) => {
  // Add specific class names based on block type
  const getBlockClasses = () => {
    switch (block.type) {
      case 'heading1':
        return 'text-3xl font-bold mt-6 mb-4 border-b pb-2';
      case 'heading2':
        return 'text-2xl font-semibold mt-5 mb-3 border-b pb-1';
      case 'heading3':
        return 'text-xl font-medium mt-4 mb-2';
      case 'list':
        return 'mt-3 mb-4 pl-5';
      case 'orderedList':
        return 'mt-3 mb-4 pl-5';
      case 'paragraph':
        return 'mt-3 mb-4 leading-relaxed';
      case 'quote':
        return 'pl-4 border-l-4 border-gray-300 italic my-4 py-2 bg-gray-50';
      default:
        return 'mt-3 mb-4';
    }
  };

  // Get human-readable block type name for badge
  const getBlockTypeName = (type: string) => {
    switch (type) {
      case 'heading1': return 'H1';
      case 'heading2': return 'H2';
      case 'heading3': return 'H3';
      case 'paragraph': return 'Paragraph';
      case 'list': return 'Bullet List';
      case 'orderedList': return 'Numbered List';
      case 'quote': return 'Quote';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get badge color based on block type
  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'heading1':
        return 'bg-blue-500 text-white';
      case 'heading2': 
        return 'bg-blue-300 text-blue-900';
      case 'heading3':
        return 'bg-blue-100 text-blue-800';
      case 'paragraph':
        return 'bg-gray-100 text-gray-800';
      case 'list':
        return 'bg-green-100 text-green-800';
      case 'orderedList':
        return 'bg-emerald-100 text-emerald-800';
      case 'quote':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              dangerouslySetInnerHTML={{ __html: `<ul class="list-disc pl-5">${listItems}</ul>` }}
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
              dangerouslySetInnerHTML={{ __html: `<ol class="list-decimal pl-5">${listItems}</ol>` }}
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

  return (
    <div className="block-container relative border-2 rounded-lg p-5 mb-4 shadow-sm hover:shadow-md transition-all bg-white">
      {showBadge && (
        <div className="absolute top-2 right-2">
          <Badge className={getBlockTypeColor(block.type)}>
            {getBlockTypeName(block.type)}
          </Badge>
        </div>
      )}
      <div className={showBadge ? "pt-6" : ""}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentBlockRenderer;
