
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { ContentBlock, GeneratedContent } from "@/services/keywords/types";
import ContentBlockList from "./editor/ContentBlockList";
import ContentEditorToolbar from "./editor/ContentEditorToolbar";
import ContentMetadata from "./editor/ContentMetadata";

interface ContentEditorProps {
  generatedContent: GeneratedContent;
  onContentUpdate?: (updatedContent: GeneratedContent) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ 
  generatedContent,
  onContentUpdate = () => {} 
}) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(generatedContent.blocks);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleEditBlock = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleSaveBlock = (blockId: string, editedContent: string) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, content: editedContent } 
        : block
    );
    
    setBlocks(updatedBlocks);
    setEditingBlockId(null);
    
    // Call parent update function
    onContentUpdate({
      ...generatedContent,
      blocks: updatedBlocks
    });
    
    toast.success("Content block updated");
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    
    // Call parent update function
    onContentUpdate({
      ...generatedContent,
      blocks: updatedBlocks
    });
    
    toast.success("Content block removed");
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (
      (direction === 'up' && blockIndex === 0) || 
      (direction === 'down' && blockIndex === blocks.length - 1)
    ) {
      return;
    }
    
    const updatedBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    // Swap blocks
    [updatedBlocks[blockIndex], updatedBlocks[targetIndex]] = 
      [updatedBlocks[targetIndex], updatedBlocks[blockIndex]];
    
    setBlocks(updatedBlocks);
    
    // Call parent update function
    onContentUpdate({
      ...generatedContent,
      blocks: updatedBlocks
    });
    
    toast.success(`Moved block ${direction}`);
  };

  const handleAddBlockAfter = (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    
    let newBlockContent = '';
    let blockType: ContentBlock['type'] = 'paragraph';
    
    // Create appropriate content based on block type
    if (type === 'list') {
      newBlockContent = '<ul><li>New bullet point item</li><li>Add more items here</li></ul>';
      blockType = 'list';
    } else if (type === 'orderedList') {
      newBlockContent = '<ol><li>First step</li><li>Second step</li><li>Third step</li></ol>';
      blockType = 'list';
    } else if (type.startsWith('heading')) {
      newBlockContent = `<${type.replace('heading', 'h')}>New Heading</${type.replace('heading', 'h')}>`;
      blockType = type as ContentBlock['type'];
    } else {
      newBlockContent = '<p>New paragraph content</p>';
      blockType = 'paragraph';
    }
    
    const newBlock: ContentBlock = {
      id: `block-${blockType}-${Date.now()}`,
      type: blockType,
      content: newBlockContent
    };
    
    const updatedBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      newBlock,
      ...blocks.slice(blockIndex + 1)
    ];
    
    setBlocks(updatedBlocks);
    
    // Call parent update function
    onContentUpdate({
      ...generatedContent,
      blocks: updatedBlocks
    });
    
    // Set the new block to editing mode
    handleEditBlock(newBlock.id);
    
    toast.success(`Added new ${type} block`);
  };

  const handleExportContent = () => {
    const contentHtml = blocks.map(block => block.content).join('\n');
    navigator.clipboard.writeText(contentHtml);
    toast.success("Content copied to clipboard");
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{generatedContent.title}</CardTitle>
        <CardDescription>{generatedContent.metaDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContentMetadata generatedContent={generatedContent} />
        
        <ContentBlockList 
          blocks={blocks}
          editingBlockId={editingBlockId}
          onEditBlock={handleEditBlock}
          onSaveBlock={handleSaveBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
          onAddBlockAfter={handleAddBlockAfter}
        />
        
        <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t">
          <ContentEditorToolbar 
            onAddBlock={(blockType) => {
              if (blocks.length > 0) {
                handleAddBlockAfter(blocks[blocks.length - 1].id, blockType);
              }
            }} 
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportContent}
          >
            <FileUp className="w-4 h-4 mr-1" /> Export HTML
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentEditor;
