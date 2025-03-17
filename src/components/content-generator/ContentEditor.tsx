
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "lucide-react";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import ContentEditorToolbar from "./editor/ContentEditorToolbar";
import ContentMetadata from "./editor/ContentMetadata";
import ContentBlockList from "./editor/ContentBlockList";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentEditorProps {
  generatedContent: GeneratedContent;
  onUpdateContent: (updatedContent: GeneratedContent) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  generatedContent,
  onUpdateContent
}) => {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>(generatedContent.blocks || []);
  const [activeTab, setActiveTab] = useState<string>("blocks"); // "blocks" or "customBlocks"

  // Update blocks when generatedContent changes
  useEffect(() => {
    if (generatedContent.blocks) {
      setBlocks(generatedContent.blocks);
    }
  }, [generatedContent]);

  // Update content when blocks change
  useEffect(() => {
    const updatedContent = blocks.map(block => block.content).join('\n');
    onUpdateContent({
      ...generatedContent,
      blocks,
      content: updatedContent
    });
  }, [blocks]);

  const handleEditBlock = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleSaveBlock = (blockId: string, content: string) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, content } : block
    );
    setBlocks(updatedBlocks);
    setEditingBlockId(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
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
  };

  const handleAddBlockAfter = (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;
    
    let newBlock: ContentBlock;
    
    if (type === 'list') {
      newBlock = {
        id: uuidv4(),
        type: 'list',
        content: '<ul><li>New item</li></ul>'
      };
    } else if (type === 'orderedList') {
      newBlock = {
        id: uuidv4(),
        type: 'orderedList',
        content: '<ol><li>New item</li></ol>'
      };
    } else {
      newBlock = {
        id: uuidv4(),
        type,
        content: type.startsWith('heading') 
          ? `<${type.replace('heading', 'h')}>New Heading</${type.replace('heading', 'h')}>`
          : '<p>New paragraph</p>'
      };
    }
    
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  return (
    <div className="space-y-6">
      <ContentMetadata generatedContent={generatedContent} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="blocks">Editor</TabsTrigger>
          <TabsTrigger value="customBlocks">
            <div className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              Custom Blocks
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="blocks" className="mt-4">
          <ContentEditorToolbar 
            onAddBlock={(type) => {
              const lastBlockId = blocks.length > 0 ? blocks[blocks.length - 1].id : null;
              if (lastBlockId) {
                handleAddBlockAfter(lastBlockId, type);
              } else {
                // If no blocks yet, create first one
                const newBlock: ContentBlock = {
                  id: uuidv4(),
                  type,
                  content: type.startsWith('heading') 
                    ? `<${type.replace('heading', 'h')}>New Heading</${type.replace('heading', 'h')}>`
                    : '<p>New paragraph</p>'
                };
                setBlocks([newBlock]);
              }
            }}
          />
          
          <div className="mt-4">
            <ContentBlockList
              blocks={blocks}
              editingBlockId={editingBlockId}
              onEditBlock={handleEditBlock}
              onSaveBlock={handleSaveBlock}
              onDeleteBlock={handleDeleteBlock}
              onMoveBlock={handleMoveBlock}
              onAddBlockAfter={handleAddBlockAfter}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="customBlocks" className="mt-4">
          <div className="border rounded-md p-4 bg-white">
            <ScrollArea className="h-[500px]">
              <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                {generatedContent.customBlocksContent || "No custom block format available. Please regenerate the content."}
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;
