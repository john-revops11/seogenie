
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
    
    // Add proper CSS classes based on block type
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: block.content }} 
        className={
          block.type === 'heading1' ? 'text-2xl font-bold mt-6 mb-3' :
          block.type === 'heading2' ? 'text-xl font-bold mt-5 mb-2' :
          block.type === 'heading3' ? 'text-lg font-bold mt-4 mb-2' :
          block.type === 'list' ? 'mt-3 mb-3 pl-5 list-disc' :
          block.type === 'orderedList' ? 'mt-3 mb-3 pl-5 list-decimal' :
          'mt-3 mb-3 leading-relaxed'
        }
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
