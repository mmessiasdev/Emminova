import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@app/lib/utils";
import { Info, AlertTriangle, AlertCircle } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus as any}
        language={match[1]}
        PreTag="div"
        className="rounded-xl my-4"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={cn("bg-secondary px-1.5 py-0.5 rounded-md text-primary font-mono text-[0.9em]", className)} {...props}>
        {children}
      </code>
    )
  },
  p: ({ children }: any) => {
    const text = React.Children.toArray(children).join("");

    if (text.startsWith(':::info')) {
      return (
        <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl flex gap-3">
          <Info className="text-blue-500 shrink-0" size={20} />
          <div className="text-sm prose-p:my-0 prose-p:leading-normal">{text.replace(/:::info|:::/g, '').trim()}</div>
        </div>
      );
    }
    if (text.startsWith(':::warning')) {
      return (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 my-4 rounded-r-xl flex gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <div className="text-sm prose-p:my-0 prose-p:leading-normal">{text.replace(/:::warning|:::/g, '').trim()}</div>
        </div>
      );
    }
    if (text.startsWith(':::danger')) {
      return (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-4 rounded-r-xl flex gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div className="text-sm prose-p:my-0 prose-p:leading-normal">{text.replace(/:::danger|:::/g, '').trim()}</div>
        </div>
      );
    }
    return <p>{children}</p>;
  },
  youtube: ({ id }: { id: string }) => (
    <div className="aspect-video w-full rounded-2xl overflow-hidden my-6 border border-border shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        className="w-full h-full"
        allowFullScreen
        title="YouTube Video"
      />
    </div>
  ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  // Pre-process markdown to ensure alerts are treated as separate paragraphs
  // even if the user forgets to add blank lines between them.
  const safeContent = (content || "*Conteúdo vazio.*")
    // Ensure blank line before opening :::
    .replace(/([^\n])\n:::(info|warning|danger)/g, '$1\n\n:::$2')
    // Ensure blank line after closing :::
    .replace(/:::\n([^\n])/g, ':::\n\n$1');

  return (
    <div className={cn(
      "prose prose-sm md:prose-base dark:prose-invert max-w-none",
      "prose-headings:text-foreground prose-headings:tracking-tight",
      "prose-h1:text-[2.75rem] prose-h1:font-black prose-h1:mb-8 prose-h1:leading-tight",
      "prose-h2:text-[2.1rem] prose-h2:font-extrabold prose-h2:mt-10 prose-h2:mb-5 prose-h2:leading-snug",
      "prose-h3:text-[1.65rem] prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4",
      "prose-h4:text-[1.35rem] prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-3",
      "prose-h5:text-[1.15rem] prose-h5:font-semibold prose-h5:mt-4 prose-h5:mb-2",
      "prose-p:text-[1.05rem] prose-p:leading-relaxed prose-p:text-muted-foreground/90",
      "prose-img:rounded-3xl prose-img:shadow-2xl prose-pre:bg-transparent prose-pre:p-0",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MarkdownComponents as any}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};
