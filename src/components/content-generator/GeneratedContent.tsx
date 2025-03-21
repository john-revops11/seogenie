
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ContentBlockRenderer from "./editor/ContentBlockRenderer";
import { ContentBlock } from "@/services/keywords/types";
import { parseContentToBlocks } from "@/services/keywords/generation/contentBlockService";

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
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(() => {
    return parseContentToBlocks(generatedContent.content);
  });

  // Re-parse when content changes
  useEffect(() => {
    setContentBlocks(parseContentToBlocks(generatedContent.content));
  }, [generatedContent.content]);

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
          ? { ...block, content: editedContent, isEditing: false } 
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
            {contentBlocks.map(block => {
              const isEditing = 'isEditing' in block && block.isEditing;
              
              return (
                <div key={block.id} className="relative group">
                  {isEditing ? (
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
                            blocks.map(b => 
                              b.id === block.id 
                                ? { ...b, isEditing: false } 
                                : b
                            )
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
              );
            })}
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
