
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ContentBlock, GeneratedContent } from "@/services/keywords/types";
import ContentBlockComponent from "./content-editor/ContentBlock";
import AddBlockActions from "./content-editor/AddBlockActions";
import ContentMetadata from "./content-editor/ContentMetadata";

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

  // Helper function to identify block types from HTML content
  const getBlockTypeFromContent = (content: string): 'paragraph' | 'list' | 'orderedList' => {
    if (content.startsWith('<ul') || content.includes('<ul>')) return 'list';
    if (content.startsWith('<ol') || content.includes('<ol>')) return 'orderedList';
    return 'paragraph';
  };

  const handleEditBlock = (blockId: string, content: string) => {
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
    handleEditBlock(newBlock.id, newBlock.content);
    
    toast.success(`Added new ${type} block`);
  };

  const getFullHtmlContent = () => {
    return blocks.map(block => block.content).join('');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{generatedContent.title}</CardTitle>
        <CardDescription>{generatedContent.metaDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContentMetadata 
          contentType={generatedContent.contentType}
          generationMethod={generatedContent.generationMethod}
          ragInfo={generatedContent.ragInfo}
        />
        
        <div className="space-y-6">
          {blocks.map((block, index) => (
            <ContentBlockComponent
              key={block.id}
              block={block}
              index={index}
              totalBlocks={blocks.length}
              isEditing={editingBlockId === block.id}
              onEdit={handleEditBlock}
              onSave={handleSaveBlock}
              onDelete={handleDeleteBlock}
              onMove={handleMoveBlock}
              onAddBlockAfter={handleAddBlockAfter}
              onCancelEdit={() => setEditingBlockId(null)}
            />
          ))}
        </div>
        
        {blocks.length > 0 && (
          <AddBlockActions
            lastBlockId={blocks[blocks.length - 1].id}
            onAddBlock={handleAddBlockAfter}
            getFullHtmlContent={getFullHtmlContent}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ContentEditor;
