import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Simple markdown parser for quiz content
// Supports: **bold**, *italic*, `code`, ```code blocks```, [links](url), and basic formatting
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const rendered = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = escapeHtml(text);

  // Code blocks (must be first to prevent inner parsing)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'text';
    return `<pre class="code-block" data-language="${language}"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Code syntax highlighting component
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'javascript', showLineNumbers = true }: CodeBlockProps) {
  const lines = code.split('\n');

  // Basic syntax highlighting patterns
  const highlightCode = (line: string): string => {
    let highlighted = escapeHtml(line);

    // Keywords
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="syntax-keyword">$1</span>');
    });

    // Strings
    highlighted = highlighted.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="syntax-string">$&</span>');

    // Numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>');

    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$1</span>');

    // Functions
    highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="syntax-function">$1</span>(');

    return highlighted;
  };

  return (
    <div className="code-block-container rounded-xl overflow-hidden border border-border bg-bg-tertiary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
        <span className="text-xs text-text-muted font-mono">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono">
          {lines.map((line, index) => (
            <div key={index} className="flex">
              {showLineNumbers && (
                <span className="select-none text-text-muted w-8 text-right pr-4 flex-shrink-0">
                  {index + 1}
                </span>
              )}
              <code
                className="flex-1 text-text-primary"
                dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
              />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// Math equation renderer (basic LaTeX-like support)
interface MathRendererProps {
  equation: string;
  block?: boolean;
}

export function MathRenderer({ equation, block = false }: MathRendererProps) {
  // Simple math symbol replacements
  const rendered = equation
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="math-frac"><span class="math-num">$1</span><span class="math-denom">$2</span></span>')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\int/g, '∫')
    .replace(/\\infty/g, '∞')
    .replace(/\\pm/g, '±')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\^(\d+)/g, '<sup>$1</sup>')
    .replace(/_(\d+)/g, '<sub>$1</sub>');

  if (block) {
    return (
      <div 
        className="math-block py-4 px-6 bg-bg-tertiary rounded-xl text-center font-mono text-lg"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    );
  }

  return (
    <span 
      className="math-inline font-mono"
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

