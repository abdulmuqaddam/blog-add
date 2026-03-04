'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

const RichTextEditor = forwardRef(function RichTextEditor({ value, onChange, placeholder }, ref) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-4',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded p-4 font-mono text-sm my-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write your blog content here...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (html) => {
      if (editor) {
        editor.commands.setContent(html);
      }
    },
    clear: () => {
      if (editor) {
        editor.commands.clearContent();
      }
    },
  }));

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const addImageUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const isActive = (type, attrs) => {
    try {
      return editor.isActive(type, attrs);
    } catch {
      return false;
    }
  };

  const btnClass = (active) => 
    `p-2 rounded transition-colors ${active ? 'bg-indigo-200 text-indigo-700' : 'hover:bg-slate-200'}`;

  return (
    <div className="border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(isActive('bold'))} title="Bold">
          <span className="font-bold">B</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(isActive('italic'))} title="Italic">
          <span className="italic">I</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(isActive('underline'))} title="Underline">
          <span className="underline">U</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(isActive('strike'))} title="Strikethrough">
          <span className="line-through">S</span>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btnClass(isActive('code'))} title="Inline Code">
          <span className="text-xs font-mono">{String.fromCharCode(60)+String.fromCharCode(47)+String.fromCharCode(62)}</span>
        </button>
        
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        <select
          onChange={(e) => {
            if (e.target.value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(e.target.value) }).run();
            }
          }}
          className="px-2 py-1 text-sm border border-slate-300 rounded"
          value={
            isActive('heading', { level: 1 }) ? '1' :
            isActive('heading', { level: 2 }) ? '2' :
            isActive('heading', { level: 3 }) ? '3' : 'paragraph'
          }
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(isActive('bulletList'))} title="Bullet List">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(isActive('orderedList'))} title="Numbered List">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(isActive('blockquote'))} title="Blockquote">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(isActive('codeBlock'))} title="Code Block">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" /></svg>
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(isActive({ textAlign: 'left' }))} title="Align Left">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" /></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(isActive({ textAlign: 'center' }))} title="Align Center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" /></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(isActive({ textAlign: 'right' }))} title="Align Right">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" /></svg>
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button type="button" onClick={setLink} className={btnClass(isActive('link'))} title="Insert Link">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
        </button>
        <button type="button" onClick={addImage} className="p-2 rounded hover:bg-slate-200 transition-colors" title="Insert Image">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded hover:bg-slate-200 transition-colors disabled:opacity-50" title="Undo">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" /></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded hover:bg-slate-200 transition-colors disabled:opacity-50" title="Redo">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" /></svg>
        </button>
      </div>

      <div className="bg-white">
        <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px] focus:outline-none" style={{ minHeight: '300px' }} />
      </div>
    </div>
  );
});

export default RichTextEditor;

