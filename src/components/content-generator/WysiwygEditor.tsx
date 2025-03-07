
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Bold from '@tiptap/extension-bold';
import { Button } from '@/components/ui/button';
import { 
  Bold as BoldIcon, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface WysiwygEditorProps {
  initialContent: string;
  onUpdate: (html: string) => void;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ initialContent, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({
        openOnClick: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Bold,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3 min-h-[200px] prose max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default WysiwygEditor;
