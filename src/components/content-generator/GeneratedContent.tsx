
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ContentBlockRenderer from "./editor/ContentBlockRenderer";
import { ContentBlock, EditableContentBlock } from "@/services/keywords/types";

interface GeneratedContentProps {
  generatedContent: {
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  };
  contentType: string;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ 
  generatedContent, 
  contentType 
}) => {
  const [contentBlocks, setContentBlocks] = useState<EditableContentBlock[]>(() => {
    return parseContentToBlocks(generatedContent.content);
  });

  // Re-parse when content changes
  useEffect(() => {
    setContentBlocks(parseContentToBlocks(generatedContent.content));
  }, [generatedContent.content]);

  function parseContentToBlocks(htmlContent: string): EditableContentBlock[] {
    if (!htmlContent) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const blocks: EditableContentBlock[] = [];
    
    Array.from(tempDiv.childNodes).forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Map HTML elements to block types
        let type: ContentBlock['type'] = 'paragraph';
        
        if (tagName === 'h1') type = 'heading1';
        else if (tagName === 'h2') type = 'heading2';
        else if (tagName === 'h3') type = 'heading3'; 
        else if (tagName === 'p') type = 'paragraph';
        else if (tagName === 'ul') type = 'list';
        else if (tagName === 'ol') type = 'orderedList';
        else if (tagName === 'blockquote') type = 'quote';
        
        blocks.push({
          id: `block-${index}`,
          type,
          content: element.outerHTML,
          isEditing: false
        });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        blocks.push({
          id: `block-${index}`,
          type: 'paragraph',
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
              <div key={block.id} className="relative group">
                {block.isEditing ? (
                  <div className="space-y-2 border-2 rounded-lg p-5 mb-4 shadow-sm">
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
                  <div className="block-wrapper">
                    <ContentBlockRenderer block={block} showBadge={true} />
                    <div className="absolute top-2 right-16 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditBlock(block.id)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteBlock(block.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1">{generatedContent.title}</h2>
        <p className="text-muted-foreground">{generatedContent.metaDescription}</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default GeneratedContent;
