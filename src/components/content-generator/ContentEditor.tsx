
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
    if (generatedContent.blocks && generatedContent.blocks.length > 0) {
      setBlocks(generatedContent.blocks);
    }
  }, [generatedContent]);

  // Update content when blocks change
  useEffect(() => {
    const updatedContent = blocks.map(block => block.content).join('\n');
    const customBlocksContent = convertToCustomBlocks(blocks);
    
    onUpdateContent({
      ...generatedContent,
      blocks,
      content: updatedContent,
      customBlocksContent
    });
  }, [blocks]);

  // Convert blocks to custom block format
  const convertToCustomBlocks = (blocks: ContentBlock[]): string => {
    let customBlockContent = '';
    
    blocks.forEach((block) => {
      switch (block.type) {
        case 'heading1':
          const h1Content = block.content.replace(/<h1>(.*?)<\/h1>/g, '$1');
          customBlockContent += `<!-- custom-block:heading {"level":1} -->\n# ${h1Content}\n<!-- /custom-block:heading -->\n\n`;
          break;
        case 'heading2':
          const h2Content = block.content.replace(/<h2>(.*?)<\/h2>/g, '$1');
          customBlockContent += `<!-- custom-block:heading {"level":2} -->\n## ${h2Content}\n<!-- /custom-block:heading -->\n\n`;
          break;
        case 'heading3':
          const h3Content = block.content.replace(/<h3>(.*?)<\/h3>/g, '$1');
          customBlockContent += `<!-- custom-block:heading {"level":3} -->\n### ${h3Content}\n<!-- /custom-block:heading -->\n\n`;
          break;
        case 'paragraph':
          const pContent = block.content.replace(/<p>(.*?)<\/p>/gs, '$1')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<.*?>/g, ''); // Remove any remaining HTML tags
          customBlockContent += `<!-- custom-block:paragraph -->\n${pContent}\n<!-- /custom-block:paragraph -->\n\n`;
          break;
        case 'list':
          let listContent = block.content;
          if (listContent.includes('<ul>')) {
            listContent = listContent.replace(/<ul>(.*?)<\/ul>/gs, '$1')
              .replace(/<li>(.*?)<\/li>/gs, '- $1\n')
              .replace(/<.*?>/g, ''); // Remove any remaining HTML tags
            customBlockContent += `<!-- custom-block:list {"type":"bullet"} -->\n${listContent}<!-- /custom-block:list -->\n\n`;
          }
          break;
        case 'orderedList':
          let orderedListContent = block.content;
          if (orderedListContent.includes('<ol>')) {
            const listItems = orderedListContent.match(/<li>(.*?)<\/li>/gs);
            let numberedList = '';
            if (listItems) {
              listItems.forEach((item, index) => {
                const content = item.replace(/<li>(.*?)<\/li>/s, '$1');
                numberedList += `${index + 1}. ${content}\n`;
              });
            }
            customBlockContent += `<!-- custom-block:list {"type":"numbered"} -->\n${numberedList}<!-- /custom-block:list -->\n\n`;
          }
          break;
        case 'quote':
          const quoteContent = block.content.replace(/<blockquote>(.*?)<\/blockquote>/gs, '$1')
            .replace(/<.*?>/g, ''); // Remove any remaining HTML tags
          customBlockContent += `<!-- custom-block:quote -->\n${quoteContent}\n<!-- /custom-block:quote -->\n\n`;
          break;
        default:
          // Handle any other block types as raw content
          customBlockContent += `<!-- custom-block:raw -->\n${block.content}\n<!-- /custom-block:raw -->\n\n`;
      }
    });
    
    return customBlockContent;
  };

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
    } else if (type === 'quote') {
      newBlock = {
        id: uuidv4(),
        type: 'quote',
        content: '<blockquote>New quote</blockquote>'
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
          <div className="border rounded-md p-4 bg-gray-50">
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
