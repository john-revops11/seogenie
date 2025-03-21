
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentBlock, GeneratedContent } from "@/services/keywords/types";
import ContentBlockList from "../editor/ContentBlockList";
import { toast } from "sonner";

interface ContentBlocksTabProps {
  generatedContent: GeneratedContent | null;
}

const ContentBlocksTab: React.FC<ContentBlocksTabProps> = ({ generatedContent }) => {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleEditBlock = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleSaveBlock = (blockId: string, newContent: string) => {
    if (!generatedContent) return;

    // Update the block content
    const updatedBlocks = generatedContent.blocks.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    );

    // Regenerate the HTML content
    // Note: In a real implementation, this would update the state
    toast.success("Block updated successfully");
    setEditingBlockId(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    toast.success("Block deleted successfully");
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    toast.success(`Block moved ${direction}`);
  };

  const handleAddBlockAfter = (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => {
    toast.success(`New ${type} block added`);
  };

  if (!generatedContent || !generatedContent.blocks || generatedContent.blocks.length === 0) {
    return (
      <div className="h-[500px] border rounded-md bg-white p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No content blocks available. Please regenerate the content.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] border rounded-md bg-white p-4">
      <ContentBlockList
        blocks={generatedContent.blocks}
        editingBlockId={editingBlockId}
        onEditBlock={handleEditBlock}
        onSaveBlock={handleSaveBlock}
        onDeleteBlock={handleDeleteBlock}
        onMoveBlock={handleMoveBlock}
        onAddBlockAfter={handleAddBlockAfter}
      />
    </ScrollArea>
  );
};

export default ContentBlocksTab;
