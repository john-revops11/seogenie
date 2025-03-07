
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit2, 
  Trash2,
  List,
  ListOrdered
} from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";

interface EditorToolbarProps {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  isEditing: boolean;
  onEdit: (blockId: string, content: string) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlockAfter: (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  block,
  index,
  totalBlocks,
  isEditing,
  onEdit,
  onDelete,
  onMove,
  onAddBlockAfter
}) => {
  if (isEditing) return null;
  
  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => onEdit(block.id, block.content)}
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => onMove(block.id, 'up')}
        disabled={index === 0}
        title="Move up"
      >
        <ArrowUpRight className="w-4 h-4" />
      </Button>
      
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => onMove(block.id, 'down')}
        disabled={index === totalBlocks - 1}
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
        onClick={() => onDelete(block.id)}
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default EditorToolbar;
