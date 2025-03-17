import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentBlock, GeneratedContent } from "@/services/keywords/types";
import ContentBlockList from "../editor/ContentBlockList";
import ContentBlockEditingToolbar from "../editor/ContentBlockEditingToolbar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ContentBlocksTabProps {
  generatedContent: GeneratedContent | null;
}

const ContentBlocksTab: React.FC<ContentBlocksTabProps> = ({ generatedContent }) => {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    generatedContent?.blocks || []
  );

  useEffect(() => {
    if (generatedContent?.blocks) {
      setBlocks(generatedContent.blocks);
    }
  }, [generatedContent]);

  const handleEditBlock = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleSaveBlock = (blockId: string, newContent: string) => {
    if (!generatedContent) return;

    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    );

    setBlocks(updatedBlocks);
    toast.success("Block updated successfully");
    setEditingBlockId(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    toast.success("Block deleted successfully");
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;
    
    const newBlocks = [...blocks];
    
    if (direction === 'up' && blockIndex > 0) {
      [newBlocks[blockIndex - 1], newBlocks[blockIndex]] = [newBlocks[blockIndex], newBlocks[blockIndex - 1]];
    } else if (direction === 'down' && blockIndex < blocks.length - 1) {
      [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
    }
    
    setBlocks(newBlocks);
    toast.success(`Block moved ${direction}`);
  };

  const handleAddBlockAfter = (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => {
    toast.success(`New ${type} block added`);
  };

  const handleApplyFormatting = (format: string) => {
    if (!editingBlockId) {
      toast.error("Please select a block to edit first");
      return;
    }

    toast.success(`Applied ${format} formatting`);
  };

  if (!generatedContent || !blocks || blocks.length === 0) {
    return (
      <div className="h-[500px] border rounded-md bg-white p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No content blocks available. Please regenerate the content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ContentBlockEditingToolbar 
        onApplyFormatting={handleApplyFormatting}
        disabled={!editingBlockId}
      />
      
      {editingBlockId && (
        <div className="bg-muted p-2 rounded-md mb-2 flex items-center gap-2">
          <span className="text-sm font-medium">Editing block:</span>
          <Input 
            className="h-8 text-sm flex-1"
            placeholder="Enter block title (optional)"
          />
        </div>
      )}
      
      <ScrollArea className="h-[500px] border rounded-md bg-white p-4">
        <ContentBlockList
          blocks={blocks}
          editingBlockId={editingBlockId}
          onEditBlock={handleEditBlock}
          onSaveBlock={handleSaveBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
          onAddBlockAfter={handleAddBlockAfter}
        />
      </ScrollArea>
    </div>
  );
};

export default ContentBlocksTab;
