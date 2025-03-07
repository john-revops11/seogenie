
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
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancelEdit(block.id)}
            >
              Done
            </Button>
          </div>
        </div>
      );
    }
    
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
