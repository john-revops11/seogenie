
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, ArrowUpRight, ArrowDownRight, Plus, Trash2 } from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";
import ContentBlockRenderer from "./ContentBlockRenderer";
import WysiwygEditor from "../WysiwygEditor";

interface ContentBlockListProps {
  blocks: ContentBlock[];
  editingBlockId: string | null;
  onEditBlock: (blockId: string) => void;
  onSaveBlock: (blockId: string, content: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlockAfter: (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => void;
}

const ContentBlockList: React.FC<ContentBlockListProps> = ({
  blocks,
  editingBlockId,
  onEditBlock,
  onSaveBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlockAfter
}) => {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div 
          key={block.id} 
          className="relative group"
        >
          <div className="pt-8">
            {editingBlockId === block.id ? (
              <div className="space-y-2">
                <WysiwygEditor 
                  initialContent={block.content}
                  onUpdate={(html) => onSaveBlock(block.id, html)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onSaveBlock(block.id, block.content)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <ContentBlockRenderer block={{...block, isEditing: false}} showBadge={true} />
            )}
          </div>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {editingBlockId !== block.id && (
              <>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onEditBlock(block.id)}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onMoveBlock(block.id, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onMoveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  title="Move down"
                >
                  <ArrowDownRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onAddBlockAfter(block.id, 'paragraph')}
                  title="Add paragraph"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-destructive" 
                  onClick={() => onDeleteBlock(block.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentBlockList;
