import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from "remark-gfm";
interface StyledMarkdownProps {
  content: string;
  primaryColor: string;
  isDarkTheme: boolean;
  className?: string;
}

export const StyledMarkdown: React.FC<StyledMarkdownProps> = memo(({
  content,
  primaryColor,
  isDarkTheme,
  className = ""
}) => {
  const codeBackgroundColor = isDarkTheme ? '#2d2d2d' : '#f6f6f6';
  const codeTextColor = isDarkTheme ? '#e0e0e0' : '#333333';
  const inlineCodeBg = isDarkTheme ? '#3a3a3a' : '#f0f0f0';
  const linkColor = primaryColor;
  const strongTagColor = isDarkTheme ? '#D6BCFA' : primaryColor;

  return (
    <>
      <div className={`prose prose-sm max-w-none break-words assistant-content pr-4 !text-gray-800 dark:!text-gray-200 ${className}`} style={{ 
        color: isDarkTheme ? '#bdbdbd' : '#333333',
      }}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              // Extract the content of the <pre> block
              const content = children[0]?.props?.children || '';
              console.log("pijan",content);
              // Check if the content is a string and contains HTML-like tags
              if (typeof content === 'string' && /<[a-z][\s\S]*>/i.test(content)) {
                // Sanitize and parse HTML content
                //const parsedContent = HTMLReactParser(DOMPurify.sanitize(content));
                return <pre>{content}</pre>;
              }
              // Fallback to default rendering for non-HTML content
              return <pre>{children}</pre>;
            },
            // Modified code renderer
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const content = String(children).replace(/\n$/, '');

              // Check if inline code
              const isInline = !match && content.split('\n').length === 1;

              if (isInline) {
                return (
                  <code
                    className="px-1.5 py-0.5 rounded-[4px] !font-mono !text-xs font-medium !bg-muted/40 dark:!bg-muted/60"
                    style={{
                      backgroundColor: `${isDarkTheme ? inlineCodeBg : inlineCodeBg}${isDarkTheme ? '40' : '80'}`,
                      color: primaryColor,
                      fontSize: '0.875rem',
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-4 w-full p-0">
                  <SyntaxHighlighter
                    style={isDarkTheme ? oneDark : oneLight}
                    language={language || 'text'}
                    PreTag="div"
                    className="rounded-lg border text-sm"
                    customStyle={{
                      margin: 0,
                      borderColor: isDarkTheme ? '#444' : '#e0e0e0',
                      backgroundColor: codeBackgroundColor,
                    }}
                    codeTagProps={{
                      style: {
                        fontSize: '0.875rem',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Segoe UI Mono", "Courier New", monospace',
                      }
                    }}
                    wrapLongLines={true}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            },
            p({ children }) {
              return <p className="mb-0 text-sm leading-5 font-normal">{children}</p>;
            },
            ul({ children }) {
              return (
                <ul className="mb-4 space-y-2 pl-0 assistant-ul">
                  {children}
                </ul>
              );
            },
            ol({ children }) {
              return (
                <ol className="mb-4 space-y-2 pl-0 assistant-ol">
                  {children}
                </ol>
              );
            },
            li({ children }) {
              return (
                <li className="assistant-li">
                  {children}
                </li>
              );
            },
            h1({ children }) {
              return <h1 className="text-2xl font-bold mb-4 mt-6" style={{ color: 'hsl(var(--primary))' }}>{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-xl font-bold mb-3 mt-5" style={{ color: 'hsl(var(--primary))' }}>{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-lg font-semibold mb-3 mt-4" style={{ color: 'hsl(var(--primary))' }}>{children}</h3>;
            },
            h4({ children }) {
              return <h4 className="text-base font-semibold mb-2 mt-3" style={{ color: primaryColor }}>{children}</h4>;
            },
            h5({ children }) {
              return <h5 className="text-sm font-semibold mb-2 mt-3" style={{ color: primaryColor }}>{children}</h5>;
            },
            h6({ children }) {
              return <h6 className="text-sm font-medium mb-2 mt-3" style={{ color: primaryColor }}>{children}</h6>;
            },
            a({ href, children }) {
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:no-underline transition-all duration-200 font-medium underline-offset-4"
                  style={{ color: linkColor }}
                >
                  {children}
                </a>
              );
            },
            strong({ children }) {
              return <strong className="font-semibold dark:text-white">{children}</strong>;
            },
            em({ children }) {
              return <em className="italic font-medium">{children}</em>;
            },
            blockquote({ children }) {
              return (
                <blockquote 
                  className="border-l-4 pl-4 py-2 my-4 italic"
                  style={{ 
                    borderLeftColor: primaryColor,
                    backgroundColor: isDarkTheme ? `${primaryColor}10` : `${primaryColor}08`
                  }}
                >
                  {children}
                </blockquote>
              );
            },
            hr() {
              // Return null to hide HR elements
              return null;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Custom CSS for list styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .assistant-content .assistant-ol {
            counter-reset: list-counter;
            list-style: none;
          }

          .assistant-content .assistant-ol > .assistant-li {
            counter-increment: list-counter;
            position: relative;
            margin-bottom: 16px;
            line-height: 1.75;
            padding-left: 1.6rem;
          }
          .playground .assistant-ol > .assistant-li {
            margin-bottom: 0px;
          }

          .assistant-content .assistant-ol > .assistant-li::before {
            content: counter(list-counter);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 19px;
            height: 19px;
            border-width: 1px;
            border-color: ${primaryColor};
            color: ${primaryColor};
            border-radius: 6px;
            font-size: 9px !important;
            font-weight: 600;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .assistant-content .assistant-ol > .assistant-li::before {
            content: counter(list-counter);
            position: absolute;
            left: 0;
            font-size: 12px;
            font-weight: 600;
            margin-top: 2px;
          }

          .assistant-content .assistant-ul {
            list-style: none;
          }

          .assistant-content .assistant-ul > .assistant-li {
            position: relative;
            margin-bottom: 12px;
            line-height: 1.75;
          }

          .playground .assistant-ul > .assistant-li {
            margin-bottom: 0px;
          }

          .assistant-content .assistant-ul > .assistant-li::before {
            content: '•';
            color: ${isDarkTheme ? '#888' : '#666'};
            font-size: 16px;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
            margin-right: 8px;
          }

          .assistant-content .assistant-li > .assistant-ul {
            margin-top: 8 px;
            margin-left: 0;
          }

          .assistant-content .assistant-li > .assistant-ul > .assistant-li {
            margin: 6px 0;
            margin-left: 0;
            line-height: 22px;
          }

          .assistant-content .assistant-li > .assistant-ul > .assistant-li::before {
            content: '–';
            color: ${isDarkTheme ? '#999' : '#777'};
            margin-right: 10px;
          }
          .assistant-content > p { 
            margin: 0;
            line-height: 22px; 
            font-size: 0.875rem !important;        
          }
          .assistant-li > p {
            padding-top: 1px ;
          }
        `
      }} />
    </>
  );
},
  (prevProps, nextProps) => {
    // Only re-render if props change
    return (
      prevProps.content === nextProps.content &&
      prevProps.primaryColor === nextProps.primaryColor &&
      prevProps.isDarkTheme === nextProps.isDarkTheme &&
      prevProps.className === nextProps.className
    );
  }
);
