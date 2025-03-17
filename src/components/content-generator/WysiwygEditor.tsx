
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft,
  AlignCenter,
  AlignJustify
} from "lucide-react";
import ContentBlockEditingToolbar from "./editor/ContentBlockEditingToolbar";

interface WysiwygEditorProps {
  initialContent: string;
  onUpdate: (content: string) => void;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ initialContent, onUpdate }) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onUpdate(e.target.value);
  };

  const applyFormatting = (format: string) => {
    const textarea = document.getElementById('wysiwyg-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = end;
    
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'h1':
        formattedText = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText}</h3>`;
        break;
      case 'ul':
        formattedText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        break;
      case 'ol':
        formattedText = `<ol>\n  <li>${selectedText}</li>\n</ol>`;
        break;
      case 'quote':
        formattedText = `<blockquote>${selectedText}</blockquote>`;
        break;
      case 'alignLeft':
        formattedText = `<div style="text-align: left">${selectedText}</div>`;
        break;
      case 'alignCenter':
        formattedText = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case 'alignJustify':
        formattedText = `<div style="text-align: justify">${selectedText}</div>`;
        break;
      default:
        return;
    }
    
    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setContent(newContent);
    onUpdate(newContent);
    
    // Set cursor position after the newly inserted text
    cursorPosition = start + formattedText.length;
    
    // setTimeout to ensure the DOM has updated
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = cursorPosition;
      textarea.selectionEnd = cursorPosition;
    }, 0);
  };

  return (
    <div className="space-y-2">
      <ContentBlockEditingToolbar onApplyFormatting={applyFormatting} />
      
      <Textarea
        id="wysiwyg-editor"
        value={content}
        onChange={handleChange}
        className="min-h-[200px] font-mono text-sm"
        placeholder="Enter your content here..."
      />
    </div>
  );
};

export default WysiwygEditor;
