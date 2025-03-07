
import React from "react";
import { Button } from "@/components/ui/button";
import { ContentBlock as ContentBlockType } from "@/services/keywords/types";
import WysiwygEditor from "../WysiwygEditor";
import EditorToolbar from "./EditorToolbar";

interface ContentBlockProps {
  block: ContentBlockType;
  index: number;
  totalBlocks: number;
  isEditing: boolean;
  onEdit: (blockId: string, content: string) => void;
  onSave: (blockId: string, content: string) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlockAfter: (blockId: string, type: ContentBlockType['type'] | 'list' | 'orderedList') => void;
  onCancelEdit: (blockId: string) => void;
}

const ContentBlockComponent: React.FC<ContentBlockProps> = ({
  block,
  index,
  totalBlocks,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onMove,
  onAddBlockAfter,
  onCancelEdit
}) => {
  const renderBlockContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <WysiwygEditor 
            initialContent={block.content}
            onUpdate={(html) => onSave(block.id, html)}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancelEdit(block.id)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onSave(block.id, block.content)}
            >
              Done
            </Button>
          </div>
        </div>
      );
    }
    
    // Determine CSS classes based on block type
    let blockClassName = "mt-3 mb-3 leading-relaxed";
    
    if (block.type === 'heading1') {
      blockClassName = 'text-2xl font-bold mt-6 mb-3';
    } else if (block.type === 'heading2') {
      blockClassName = 'text-xl font-bold mt-5 mb-2';
    } else if (block.type === 'heading3') {
      blockClassName = 'text-lg font-bold mt-4 mb-2';
    } else if (block.type === 'list') {
      blockClassName = 'mt-3 mb-3 pl-5 list-disc';
    } else if (block.type === 'paragraph') {
      blockClassName = 'mt-3 mb-3 leading-relaxed';
    }
    
    // Special handling for nested content with list types
    const content = block.content;
    const hasOrderedList = content.includes('<ol>') || content.includes('<ol ');
    const hasBulletList = content.includes('<ul>') || content.includes('<ul ');
    
    if (hasOrderedList) {
      blockClassName += ' list-decimal';
    } else if (hasBulletList) {
      blockClassName += ' list-disc';
    }
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: content }} 
        className={blockClassName}
      />
    );
  };

  return (
    <div className="relative group border rounded-md p-4 hover:bg-gray-50 transition-colors">
      {renderBlockContent()}
      
      <EditorToolbar 
        block={block}
        index={index}
        totalBlocks={totalBlocks}
        isEditing={isEditing}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        onAddBlockAfter={onAddBlockAfter}
      />
    </div>
  );
};

export default ContentBlockComponent;
