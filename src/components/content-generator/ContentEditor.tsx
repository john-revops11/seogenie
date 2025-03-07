
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, Trash2, Plus, FileUp, ArrowUpRight, ArrowDownRight, List, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { ContentBlock, GeneratedContent } from "@/services/keywords/types";

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
  const [editedContent, setEditedContent] = useState<string>("");

  // Helper function to identify block types from HTML content
  const getBlockTypeFromContent = (content: string): 'paragraph' | 'list' | 'orderedList' => {
    if (content.startsWith('<ul') || content.includes('<ul>')) return 'list';
    if (content.startsWith('<ol') || content.includes('<ol>')) return 'orderedList';
    return 'paragraph';
  };

  const handleEditBlock = (blockId: string, content: string) => {
    setEditingBlockId(blockId);
    setEditedContent(content);
  };

  const handleSaveBlock = (blockId: string) => {
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

  const renderBlockContent = (block: ContentBlock) => {
    if (editingBlockId === block.id) {
      return (
        <div className="space-y-2">
          <Textarea
            className="min-h-[100px] font-mono text-sm"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleSaveBlock(block.id)}>
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingBlockId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: block.content }} 
        className={
          block.type === 'heading1' ? 'text-2xl font-bold' :
          block.type === 'heading2' ? 'text-xl font-bold mt-4' :
          block.type === 'heading3' ? 'text-lg font-bold mt-3' :
          block.type === 'list' ? 'mt-2 list-content' :
          'mt-2'
        }
      />
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{generatedContent.title}</CardTitle>
        <CardDescription>{generatedContent.metaDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          <div>Content Type: {generatedContent.contentType}</div>
          <div>Generation Method: {generatedContent.generationMethod === 'rag' ? 'RAG-Enhanced' : 'Standard'}</div>
          {generatedContent.ragInfo && (
            <div>RAG Info: {generatedContent.ragInfo.chunksRetrieved} chunks retrieved (avg. score: {generatedContent.ragInfo.relevanceScore.toFixed(2)})</div>
          )}
        </div>
        
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div 
              key={block.id} 
              className="relative group border rounded-md p-4 hover:bg-gray-50 transition-colors"
            >
              {renderBlockContent(block)}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleEditBlock(block.id, block.content)}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleMoveBlock(block.id, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleMoveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  title="Move down"
                >
                  <ArrowDownRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleAddBlockAfter(block.id, 'paragraph')}
                  title="Add paragraph"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-destructive" 
                  onClick={() => handleDeleteBlock(block.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddBlockAfter(blocks[blocks.length - 1].id, 'heading2')}
            >
              <Plus className="w-4 h-4 mr-1" /> H2 Heading
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddBlockAfter(blocks[blocks.length - 1].id, 'heading3')}
            >
              <Plus className="w-4 h-4 mr-1" /> H3 Heading
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddBlockAfter(blocks[blocks.length - 1].id, 'paragraph')}
            >
              <Plus className="w-4 h-4 mr-1" /> Paragraph
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddBlockAfter(blocks[blocks.length - 1].id, 'list')}
            >
              <List className="w-4 h-4 mr-1" /> Bullet List
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddBlockAfter(blocks[blocks.length - 1].id, 'orderedList')}
            >
              <ListOrdered className="w-4 h-4 mr-1" /> Numbered List
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const contentHtml = blocks.map(block => block.content).join('\n');
              navigator.clipboard.writeText(contentHtml);
              toast.success("Content copied to clipboard");
            }}
          >
            <FileUp className="w-4 h-4 mr-1" /> Export HTML
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentEditor;

