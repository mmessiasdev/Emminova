import React, { useEffect, useRef, useState } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { cn } from "@app/lib/utils";

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

// Disable aggressive escaping
turndownService.escape = function (string) {
  return string; 
};

// Turndown Rules
turndownService.addRule('customAlert', {
  filter: function (node) {
    return node.nodeName === 'DIV' && node.className.startsWith('alert-');
  },
  replacement: function (content, node) {
    const type = node.className.replace('alert-', '');
    // remove any internal HTML left over
    const cleanContent = content.replace(/<[^>]*>?/gm, '').trim();
    return `\n\n:::${type}\n${cleanContent}\n:::\n\n`;
  }
});

turndownService.addRule('youtube', {
  filter: function (node) {
    return node.nodeName === 'DIV' && node.className === 'youtube-embed';
  },
  replacement: function (content, node) {
    return `\n<youtube id="${(node as HTMLElement).getAttribute('data-id')}"></youtube>\n`;
  }
});

// Marked Extensions
marked.use({
  extensions: [
    {
      name: 'customAlert',
      level: 'block',
      start(src) { return src.match(/^:::(info|warning|danger)/)?.index; },
      tokenizer(src) {
        const rule = /^:::(info|warning|danger)\n([\s\S]*?)\n:::/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'customAlert',
            raw: match[0],
            alertType: match[1],
            text: match[2].trim()
          };
        }
      },
      renderer(token) {
        const bgColors: any = { info: '#3b82f61a', warning: '#f59e0b1a', danger: '#ef44441a' };
        const borderColors: any = { info: '#3b82f6', warning: '#f59e0b', danger: '#ef4444' };
        return `<div class="alert-${token.alertType}" style="background-color: ${bgColors[token.alertType]}; border-left: 4px solid ${borderColors[token.alertType]}; padding: 1rem; margin: 1rem 0; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.875rem;">${token.text}</div>`;
      }
    },
    {
      name: 'youtube',
      level: 'block',
      start(src) { return src.match(/<youtube/)?.index; },
      tokenizer(src) {
        const rule = /^<youtube id="([^"]+)"><\/youtube>/;
        const match = rule.exec(src);
        if (match) return { type: 'youtube', raw: match[0], id: match[1] };
      },
      renderer(token) {
        return `<div class="youtube-embed" contenteditable="false" data-id="${token.id}" style="aspect-ratio: 16/9; background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; border-radius: 1rem; margin: 1.5rem 0; font-family: monospace;">[Vídeo do YouTube: ${token.id}]</div>`;
      }
    }
  ]
});

interface SimplifiedWysiwygProps {
  markdown: string;
  onChange: (markdown: string) => void;
  className?: string;
}

export const SimplifiedWysiwyg: React.FC<SimplifiedWysiwygProps> = ({ markdown, onChange, className }) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current) {
      const html = marked.parse(markdown || '', { async: false }) as string;
      setHtmlContent(html);
    }
    isInternalChange.current = false;
  }, [markdown]);

  const handleInput = () => {
    if (!contentEditableRef.current) return;
    isInternalChange.current = true;
    const html = contentEditableRef.current.innerHTML;
    const newMarkdown = turndownService.turndown(html);
    onChange(newMarkdown);
  };

  return (
    <div
      ref={contentEditableRef}
      contentEditable
      data-lenis-prevent
      onInput={handleInput}
      onBlur={handleInput}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      className={cn(
        "prose prose-sm md:prose-base dark:prose-invert max-w-none min-h-[600px] outline-none",
        "prose-headings:text-foreground prose-headings:tracking-tight",
        "prose-h1:text-[2.75rem] prose-h1:font-black prose-h1:mb-8 prose-h1:leading-tight",
        "prose-h2:text-[2.1rem] prose-h2:font-extrabold prose-h2:mt-10 prose-h2:mb-5 prose-h2:leading-snug",
        "prose-h3:text-[1.65rem] prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4",
        "prose-h4:text-[1.35rem] prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-3",
        "prose-h5:text-[1.15rem] prose-h5:font-semibold prose-h5:mt-4 prose-h5:mb-2",
        "prose-p:text-[1.05rem] prose-p:leading-relaxed prose-p:text-muted-foreground/90",
        "prose-img:rounded-3xl prose-img:shadow-2xl prose-pre:bg-transparent prose-pre:p-0",
        "focus:outline-none empty:before:content-['Digite_seu_texto_aqui...'] empty:before:text-muted-foreground/50",
        className
      )}
    />
  );
};
