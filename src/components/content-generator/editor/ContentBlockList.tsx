
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, ArrowUpRight, ArrowDownRight, Plus, Trash2 } from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";
import ContentBlockRenderer from "./ContentBlockRenderer";
import WysiwygEditor from "../WysiwygEditor";
import { Badge } from "@/components/ui/badge";

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
  // Helper function to get badge color based on block type
  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'heading1':
      case 'heading2': 
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

  // Helper function to get human-readable block type name
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

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div 
          key={block.id} 
          className="relative group border rounded-md p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="absolute top-2 left-2 z-10">
            <Badge className={getBlockTypeColor(block.type)} variant="outline">
              {getBlockTypeName(block.type)}
            </Badge>
          </div>
          
          <div className="pt-6">
            {editingBlockId === block.id ? (
              <div className="space-y-2">
                <WysiwygEditor 
                  initialContent={block.content}
                  onUpdate={(html) => onSaveBlock(block.id, html)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSaveBlock(block.id, block.content)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <ContentBlockRenderer block={block} />
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
