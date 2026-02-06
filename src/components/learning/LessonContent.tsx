import { useMemo } from 'react';

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  const htmlContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return (
    <div 
      className="prose prose-slate dark:prose-invert max-w-none
        prose-headings:text-foreground prose-headings:font-semibold
        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-ul:my-4 prose-li:text-muted-foreground
        prose-ol:my-4
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border
        prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

// Simple markdown parser
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists (numbered)
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Fix consecutive list items
  html = html.replace(/<\/li>\n<li>/g, '</li><li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, (match) => {
    if (!match.includes('<ul>') && !match.includes('<ol>')) {
      return `<ul>${match}</ul>`;
    }
    return match;
  });

  // Paragraphs (double newlines)
  html = html.replace(/\n\n(?!<)/gim, '</p><p>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<(h[1-6]|ul|ol|blockquote|pre)/g, '<$1');
  html = html.replace(/<\/(h[1-6]|ul|ol|blockquote|pre)>\s*<\/p>/g, '</$1>');

  // Line breaks
  html = html.replace(/\n/gim, '<br />');
  html = html.replace(/<br \/><br \/>/g, '</p><p>');

  return html;
}
