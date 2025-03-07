
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GeneratedContentProps {
  generatedContent: {
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  };
  contentType: string;
}

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  isEditing: boolean;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ 
  generatedContent, 
  contentType 
}) => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(() => {
    return parseContentToBlocks(generatedContent.content);
  });

  function parseContentToBlocks(htmlContent: string): ContentBlock[] {
    if (!htmlContent) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const blocks: ContentBlock[] = [];
    
    Array.from(tempDiv.childNodes).forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
          blocks.push({
            id: `block-${index}`,
            type: tagName,
            content: element.outerHTML,
            isEditing: false
          });
        } else if (['ul', 'ol'].includes(tagName)) {
          blocks.push({
            id: `block-${index}`,
            type: tagName,
            content: element.outerHTML,
            isEditing: false
          });
        } else {
          blocks.push({
            id: `block-${index}`,
            type: 'other',
            content: element.outerHTML,
            isEditing: false
          });
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        blocks.push({
          id: `block-${index}`,
          type: 'text',
          content: `<p>${node.textContent}</p>`,
          isEditing: false
        });
      }
    });
    
    return blocks;
  }

  const handleEditBlock = (blockId: string) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId 
          ? { ...block, isEditing: true } 
          : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== blockId));
    toast.success("Content block removed");
  };

  const handleSaveBlock = (blockId: string, editedContent: string) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              content: editedContent,
              isEditing: false 
            } 
          : block
      )
    );
    toast.success("Content block updated");
  };

  const getFullHtmlContent = () => {
    return contentBlocks.map(block => block.content).join('');
  };

  const renderContent = () => {
    if (!generatedContent) return null;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Content Type: {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</h3>
          {contentType === "case-study" && (
            <p className="text-sm text-muted-foreground">
              Structure: Banner Title, Description, Situation, Obstacles, Action, Results
            </p>
          )}
          {contentType === "white-paper" && (
            <p className="text-sm text-muted-foreground">
              Structure: Header, Title, Table of Contents, Executive Summary, Introduction, Main Sections, Conclusion
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Outline</h3>
          <ul className="list-disc pl-5">
            {generatedContent.outline.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Content</h3>
          <div className="space-y-4 prose max-w-none">
            {contentBlocks.map(block => (
              <div key={block.id} className="relative group border rounded-md p-4 hover:bg-gray-50 transition-colors">
                {block.isEditing ? (
                  <div className="space-y-2">
                    <Textarea 
                      className="min-h-[100px] font-mono text-sm"
                      defaultValue={block.content}
                      id={`edit-${block.id}`}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveBlock(
                          block.id, 
                          (document.getElementById(`edit-${block.id}`) as HTMLTextAreaElement).value
                        )}
                      >
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setContentBlocks(blocks => 
                          blocks.map(b => b.id === block.id ? { ...b, isEditing: false } : b)
                        )}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      dangerouslySetInnerHTML={{ __html: block.content }} 
                      className={
                        block.type === 'h1' ? 'text-2xl font-bold mb-2' :
                        block.type === 'h2' ? 'text-xl font-bold mt-4 mb-2' :
                        block.type === 'h3' ? 'text-lg font-bold mt-3 mb-2' :
                        block.type === 'ul' || block.type === 'ol' ? 'pl-5 my-2 space-y-1' :
                        'my-2'
                      }
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditBlock(block.id)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteBlock(block.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{generatedContent.title}</CardTitle>
        <CardDescription>{generatedContent.metaDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default GeneratedContent;
