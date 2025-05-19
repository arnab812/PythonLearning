import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    CircularProgress,
    Chip,
    Fab,
    Zoom,
    IconButton,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

// Custom "Winter is Coming" theme based on VS Code theme
const winterIsComingTheme = {
    ...vscDarkPlus,
    'code[class*="language-"]': {
        ...vscDarkPlus['code[class*="language-"]'],
        color: '#d6deeb',
        background: '#011627',
    },
    'pre[class*="language-"]': {
        ...vscDarkPlus['pre[class*="language-"]'],
        background: '#011627',
    },
    'comment': {
        color: '#5c6773'
    },
    'punctuation': {
        color: '#d9f5dd'
    },
    'string': {
        color: '#addb67'
    },
    'keyword': {
        color: '#c792ea'
    },
    'function': {
        color: '#82aaff'
    },
    'boolean': {
        color: '#ff5874'
    },
    'number': {
        color: '#f78c6c'
    },
    'operator': {
        color: '#c792ea'
    },
    'class-name': {
        color: '#ffcb8b'
    },
};

const Chatbot = ({ messages, streamingMessage, responseTime }) => {
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [userHasScrolled, setUserHasScrolled] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);
    const [showCopyNotification, setShowCopyNotification] = useState(false);

    // Check if user is near the bottom of the chat
    const checkIfNearBottom = () => {
        if (!chatContainerRef.current) return true;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const scrollPosition = scrollTop + clientHeight;
        const scrollThreshold = 100; // pixels from bottom to consider "near bottom"

        const nearBottom = scrollHeight - scrollPosition < scrollThreshold;
        setIsNearBottom(nearBottom);

        return nearBottom;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle scroll events
    const handleScroll = () => {
        setUserHasScrolled(true);
        checkIfNearBottom();
    };

    // Add scroll event listener
    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
            return () => chatContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Smart scrolling logic
    useEffect(() => {
        // Always scroll to bottom when a new message is added
        if (messages.length > 0) {
            // If user hasn't scrolled or is already near bottom, scroll to bottom
            if (!userHasScrolled || isNearBottom) {
                scrollToBottom();
            }
        } else {
            // If there are no messages, always scroll to bottom
            scrollToBottom();
        }

        // Reset userHasScrolled when a new message is added (not from streaming)
        // This helps with the common case where a user sends a new message
        setUserHasScrolled(false);
    }, [messages]);

    // Handle streaming message updates
    useEffect(() => {
        // Only auto-scroll for streaming messages if user is already at the bottom
        if (streamingMessage && (!userHasScrolled || isNearBottom)) {
            scrollToBottom();
        }
    }, [streamingMessage, isNearBottom, userHasScrolled]);

    // Handle code copy functionality
    const handleCopyCode = (code, index) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                setCopiedCode(index);
                setShowCopyNotification(true);
                setTimeout(() => {
                    setCopiedCode(null);
                    setShowCopyNotification(false);
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code: ', err);
            });
    };

    // Process Markdown tables into HTML tables
    const processMarkdownTable = (text) => {
        // First, let's handle tables with different formats
        // Some tables use | to start/end rows, others don't
        // Some use --- as separator, others use === or other characters

        // Normalize the table format first
        let normalizedText = text;

        // Extract the table portion from the text
        // Look for patterns that indicate a table structure
        const tablePattern = /([^\n]*\|[^\n]*\n[-|\s:]+\n[^\n]*\|[^\n]*(\n[^\n]*\|[^\n]*)*)/g;
        const alternativeTablePattern = /([^\n]*\t[^\n]*\n[-\t\s:]+\n[^\n]*\t[^\n]*(\n[^\n]*\t[^\n]*)*)/g;
        const spaceSeparatedTablePattern = /([\w\s]+\s{2,}[\w\s]+\s{2,}[\w\s]+\n[-\s]+\s{2,}[-\s]+\s{2,}[-\s]+(\n[\w\s]+\s{2,}[\w\s]+\s{2,}[\w\s]+)*)/g;

        // Special pattern for tables with Symbol/Function format (common in documentation)
        const docTablePattern = /(Symbol\s*\/\s*Function|What it is|Signature|Returns)[\s\S]*?[-]{3,}[\s\S]*?([-]{3,})/g;

        // Pattern for tables with dashed separator lines
        const dashedTablePattern = /([^\n]+\n[-]{3,}[^\n]*\n[^\n]+)/g;

        // Pattern for documentation-style tables with multiple columns and dashed separators
        const docStyleTablePattern = /([^\n]+\n[-]+\s+[-]+\s+[-]+\n[^\n]+)/g;

        // Pattern for tables with a row of dashes under the header (like the example with "------------")
        const dashSeparatorTablePattern = /([^\n]+\n[-]+(\s+[-]+)*\n[^\n]+)/g;

        // Pattern specifically for the format in the example
        // "Category\tTypical Built-ins\tCan be changed in place?\tSame id() after change?\n------------\t------------------\t--------------------------\t---------------------------"
        const tabSeparatedWithDashesPattern = /([^\n]+\n[-]+(\t[-]+)+\n[^\n]+)/g;

        // Pattern for tables with a simple dash separator row (like "----------	-----------	---------")
        const simpleDashSeparatorPattern = /([^\n]+\n[-]+(\t[-]+)*\n[^\n]+(\n[^\n]+)*)/g;

        // Pattern specifically for the example you provided
        // "Category\tImmutable\tMutable\n----------\t-----------\t---------\nNumbers\tint, float, complex, bool..."
        const categoryTablePattern = /(Category\s*\t\s*Immutable\s*\t\s*Mutable\s*\n[-]+\s*\t\s*[-]+\s*\t\s*[-]+\s*\n[^\n]+(\n[^\n]+)*)/g;

        // Try to find a table in the text
        let tableMatch = normalizedText.match(categoryTablePattern) || // Try the specific pattern first
                         normalizedText.match(tablePattern) ||
                         normalizedText.match(alternativeTablePattern) ||
                         normalizedText.match(spaceSeparatedTablePattern) ||
                         normalizedText.match(docTablePattern) ||
                         normalizedText.match(dashedTablePattern) ||
                         normalizedText.match(docStyleTablePattern) ||
                         normalizedText.match(dashSeparatorTablePattern) ||
                         normalizedText.match(tabSeparatedWithDashesPattern) ||
                         normalizedText.match(simpleDashSeparatorPattern);

        if (tableMatch) {
            // Use the first match as our table
            normalizedText = tableMatch[0];
        }

        // Check if we have a table with dashes/equals as row separators without pipes
        if (normalizedText.includes('\n---') || normalizedText.includes('\n===') ||
            normalizedText.match(/\n[-]{3,}/)) {
            // This is likely a table with headers and separators but no pipes
            // Convert it to a pipe-separated table
            const lines = normalizedText.split('\n');
            const normalizedLines = [];

            // First, detect if this is a space-separated table
            // Look for consistent spacing patterns
            let columnPositions = [];
            let isSpaceSeparated = false;

            // Find header line and separator line
            let headerLine = '';
            let separatorLine = '';

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/^[-=\s]+$/)) {
                    separatorLine = lines[i];
                    if (i > 0) {
                        headerLine = lines[i-1];
                        break;
                    }
                }
            }

            // If we found a header and separator, analyze the column positions
            if (headerLine && separatorLine) {
                // Find positions where there are multiple spaces in the header
                const spacesPattern = /\s{2,}/g;
                let match;
                columnPositions.push(0); // Start of first column

                while ((match = spacesPattern.exec(headerLine)) !== null) {
                    columnPositions.push(match.index + match[0].length);
                }

                isSpaceSeparated = columnPositions.length > 1;
            }

            // Process each line based on the detected format
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Skip empty lines
                if (!line) continue;

                // Check if this is a separator line (dashes, equals, etc.)
                if (/^[-=\s]+$/.test(line)) {
                    if (isSpaceSeparated && columnPositions.length > 1) {
                        // Create a separator line with the right number of columns
                        normalizedLines.push('|' + Array(columnPositions.length).fill('---').join('|') + '|');
                    } else {
                        // Fallback: split by multiple spaces
                        const parts = line.split(/\s{2,}/);
                        normalizedLines.push('|' + parts.map(() => '---').join('|') + '|');
                    }
                } else {
                    // This is a content line, convert it to pipe format if it's not already
                    if (!line.includes('|')) {
                        if (isSpaceSeparated && columnPositions.length > 1) {
                            // Split the line based on the detected column positions
                            let cells = [];
                            for (let j = 0; j < columnPositions.length; j++) {
                                const start = columnPositions[j];
                                const end = j < columnPositions.length - 1 ? columnPositions[j+1] : line.length;
                                cells.push(line.substring(start, end).trim());
                            }
                            normalizedLines.push('|' + cells.join('|') + '|');
                        } else if (line.includes('\t')) {
                            // Tab-separated format
                            const parts = line.split('\t');
                            normalizedLines.push('|' + parts.join('|') + '|');
                        } else if (line.match(/^[a-zA-Z0-9.]+\([^)]*\)\s+→\s+/)) {
                            // Special case for function signature format like "math.sqrt(x) → float"
                            const parts = line.split(/\s+→\s+/);
                            if (parts.length > 1) {
                                const restParts = parts[1].split(/\s{2,}/);
                                const allParts = [parts[0], ...restParts];
                                normalizedLines.push('|' + allParts.join('|') + '|');
                            } else {
                                // Fallback to regular space splitting
                                const parts = line.split(/\s{2,}/);
                                normalizedLines.push('|' + parts.join('|') + '|');
                            }
                        } else {
                            // Fallback: split by multiple spaces
                            const parts = line.split(/\s{2,}/);
                            normalizedLines.push('|' + parts.join('|') + '|');
                        }
                    } else {
                        normalizedLines.push(line);
                    }
                }
            }

            normalizedText = normalizedLines.join('\n');
        }

        // Now process the normalized table
        // Filter out separator lines that are just dashes or dashes with spaces
        // This specifically handles the case like "------------" or "---- ---- ----"
        // First, let's identify if this is a table with a dash separator row
        const hasDashSeparatorRow = normalizedText.split('\n').some(line => {
            return line.trim().match(/^[-]+(\t[-]+)*$/) ||
                   line.trim().match(/^[-]+(\s+[-]+)*$/);
        });

        // If we have a dash separator row, we need to handle it specially
        let filteredLines;
        if (hasDashSeparatorRow) {
            // Split the text into lines
            const lines = normalizedText.split('\n');

            // Find the header row and content rows
            let headerRow = null;
            const contentRows = [];
            let foundSeparator = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Check if this is a separator row
                if (line.match(/^[-]+(\t[-]+)*$/) ||
                    line.match(/^[-]+(\s+[-]+)*$/) ||
                    line === '----------' ||
                    line.startsWith('----------\t') ||
                    line.includes('-----------')) {
                    // This is a separator row, mark that we found it
                    foundSeparator = true;
                    // The previous line is the header
                    if (i > 0) {
                        headerRow = lines[i-1];
                    }
                    continue;
                }

                // If we've found the separator, this is a content row
                if (foundSeparator) {
                    contentRows.push(line);
                }
            }

            // Reconstruct the table without the separator row
            if (headerRow) {
                // If we have a header row, make sure it's properly formatted
                filteredLines = [headerRow];

                // Add all content rows
                contentRows.forEach(row => {
                    if (row.trim()) { // Skip empty rows
                        filteredLines.push(row);
                    }
                });

            } else {
                // If we don't have a header row, just use the content rows
                filteredLines = contentRows;
            }
        } else {
            // For other tables, use the regular filtering
            filteredLines = normalizedText.split('\n').filter(line => {
                const trimmedLine = line.trim();
                // Check for various separator patterns
                return !(trimmedLine.match(/^[-]{3,}$/) ||
                        trimmedLine.match(/^[-]+(\s+[-]+)*$/) ||
                        trimmedLine.match(/^[-]+(\t[-]+)+$/) ||
                        trimmedLine === '------------' ||
                        trimmedLine.startsWith('----------\t') ||
                        trimmedLine.startsWith('------------\t') ||
                        trimmedLine.includes('------------------'));
            });
        }

        let tableHtml = '<table class="markdown-table">';
        // For tables with dash separators, isHeader is determined in the filtering logic
        let isHeader = true; // Default to true for most tables
        if (hasDashSeparatorRow) {
            // For tables with dash separators, the first row is always a header
            isHeader = true;
        }

        let currentRow = [];
        let inCodeBlock = false;
        let currentCell = '';
        let hasProcessedSeparator = false;

        // First pass: collect cells properly handling multi-line cells and code blocks
        for (let i = 0; i < filteredLines.length; i++) {
            const line = filteredLines[i].trim();

            // Skip empty lines unless we're in a code block
            if (!line && !inCodeBlock) continue;

            // Check for code block markers
            if (line.includes('```')) {
                inCodeBlock = !inCodeBlock;
                currentCell += line + '\n';
                continue;
            }

            // If we're in a code block, just add the line to the current cell
            if (inCodeBlock) {
                currentCell += line + '\n';
                continue;
            }

            // Check if this is a separator line
            if (line.match(/^\|[\s-:=]+\|[\s-:=]*\|?$/) ||
                (line.match(/^[-=\s:]+$/) && i > 0 && filteredLines[i-1].includes('|'))) {

                hasProcessedSeparator = true;
                isHeader = false;

                // If we have a current row, add it to the table
                if (currentRow.length > 0) {
                    tableHtml += '<tr>';
                    for (const cell of currentRow) {
                        tableHtml += `<th>${processTableCell(cell)}</th>`;
                    }
                    tableHtml += '</tr>';
                    currentRow = [];
                }

                // Add a thead/tbody separator
                tableHtml += '</thead><tbody>';

                continue;
            }

            // Skip lines that are just dashes (often used as visual separators in text)
            // Also skip lines that look like table separators with dashes and spaces
            if (line.match(/^[-]{3,}$/) || line.match(/^[-\s]+$/) || line.match(/^[-]{2,}\s+[-]{2,}/) || line === '------------') {
                continue;
            }

            // Check if this is a new row
            if (line.includes('|')) {
                // If we have content in currentCell, add it to the current row
                if (currentCell) {
                    currentRow.push(currentCell);
                    currentCell = '';
                }

                // Process the new row
                const cells = line.split('|')
                    .filter((_, index, array) => {
                        // Keep all cells except empty first/last cells when they're just padding
                        if (index === 0 && !array[0].trim()) return false;
                        if (index === array.length - 1 && !array[array.length - 1].trim()) return false;
                        return true;
                    })
                    .map(cell => cell.trim());

                // If we already have a row in progress, add this to the table
                if (currentRow.length > 0) {
                    tableHtml += '<tr>';
                    for (const cell of currentRow) {
                        tableHtml += isHeader
                            ? `<th>${processTableCell(cell)}</th>`
                            : `<td>${processTableCell(cell)}</td>`;
                    }
                    tableHtml += '</tr>';
                }

                // Start a new row
                currentRow = cells;
            } else {
                // This is a continuation of the current cell
                currentCell += line + '\n';
            }
        }

        // Add any remaining row
        if (currentRow.length > 0) {
            tableHtml += '<tr>';
            for (const cell of currentRow) {
                tableHtml += isHeader
                    ? `<th>${processTableCell(cell)}</th>`
                    : `<td>${processTableCell(cell)}</td>`;
            }
            tableHtml += '</tr>';
        }

        // Close the table
        if (hasProcessedSeparator) {
            tableHtml += '</tbody></table>';
        } else {
            tableHtml += '</table>';
        }

        return tableHtml;
    };

    // Helper function to process the content of a table cell
    const processTableCell = (content) => {
        // Handle code blocks in cells
        if (content.includes('```')) {
            // Extract language and code
            const codeBlockMatch = content.match(/```(\w+)?\n?([\s\S]*?)```/);
            if (codeBlockMatch) {
                const [, language, code] = codeBlockMatch;
                const displayLanguage = language || 'text';
                const trimmedCode = code.trim();

                // Replace the code block with styled pre/code
                content = content.replace(
                    /```(\w+)?\n?([\s\S]*?)```/g,
                    `<pre class="code-block"><code class="language-${displayLanguage}">${trimmedCode}</code></pre>`
                );
            }
        }

        // Process other inline formatting - use non-greedy matching for better handling of non-Latin scripts
        return content
            // Process inline code
            .replace(/`([^`]+?)`/g, '<code>$1</code>')
            // Process bold text - use non-greedy matching
            .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
            // Process italic text - use non-greedy matching
            .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
            // Convert newlines to <br>
            .replace(/\n/g, '<br>');
    };

    // Process message content to identify and format different parts
    const renderMessageContent = (content) => {
        // Check if content is empty or undefined
        if (!content) return null;

        // Check if we're rendering a user message
        const isUserMessage = messages.find(msg => msg.content === content)?.type === 'user';

        // For user messages, don't apply any formatting - just return the raw content
        if (isUserMessage) {
            // Split content by code blocks in case user manually entered code blocks
            const parts = content.split(/(```[\s\S]*?```)/g);

            return parts.map((part, index) => {
                if (part.startsWith('```')) {
                    // Extract language and code from code block
                    const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                    if (match) {
                        const [, language, code] = match;
                        const displayLanguage = language || 'python';
                        const trimmedCode = code.trim();

                        return (
                            <SyntaxHighlighter
                                key={index}
                                language={displayLanguage}
                                style={winterIsComingTheme}
                                customStyle={{
                                    margin: '1em 0',
                                    borderRadius: '8px',
                                    padding: '1em',
                                    fontSize: '0.9em',
                                    backgroundColor: '#011627'
                                }}
                                showLineNumbers={false}
                            >
                                {trimmedCode}
                            </SyntaxHighlighter>
                        );
                    }
                }

                // For regular text in user messages, just return it as is
                return (
                    <Typography
                        key={index}
                        variant="body1"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                            color: 'text.primary', // Default black text
                            fontWeight: 400
                        }}
                    >
                        {part}
                    </Typography>
                );
            });
        }

        // For bot messages, continue with enhanced formatting

        // Helper function to detect if text contains markdown code blocks
        const containsMarkdownCodeBlocks = (text) => {
            return /```[\s\S]*?```/g.test(text);
        };

        // Helper function to detect if text contains inline code
        const containsInlineCode = (text) => {
            return /`[^`]+`/g.test(text);
        };

        // Helper function to format plain text code blocks (indented blocks)
        const formatPlainTextCodeBlocks = (text) => {
            // Look for indented blocks that might be code
            const lines = text.split('\n');
            const formattedLines = [];
            let inCodeBlock = false;
            let codeBlock = [];
            let codeBlockIndent = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const indent = line.search(/\S|$/);

                // Detect potential code blocks by indentation pattern
                if (indent >= 4 && !inCodeBlock) {
                    // Start of a code block
                    inCodeBlock = true;
                    codeBlockIndent = indent;
                    codeBlock = [line.substring(indent)]; // Remove indentation
                } else if (inCodeBlock) {
                    if (indent >= codeBlockIndent || line.trim() === '') {
                        // Continue code block
                        codeBlock.push(line.substring(Math.min(indent, codeBlockIndent)));
                    } else {
                        // End of code block
                        formattedLines.push('```python\n' + codeBlock.join('\n') + '\n```');
                        inCodeBlock = false;
                        formattedLines.push(line);
                    }
                } else {
                    formattedLines.push(line);
                }
            }

            // Handle any remaining code block
            if (inCodeBlock) {
                formattedLines.push('```python\n' + codeBlock.join('\n') + '\n```');
            }

            return formattedLines.join('\n');
        };

        // Helper function to format inline code in plain text
        const formatInlineCode = (text) => {
            // Look for patterns that might be inline code (variable names, function calls, etc.)
            return text.replace(/\b([A-Za-z0-9_]+\(\)|\w+\.\w+|\w+\[\w+\]|[A-Za-z0-9_]+)\b/g, (match) => {
                // Don't format common English words
                const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'you', 'your', 'can', 'will'];
                if (commonWords.includes(match.toLowerCase())) {
                    return match;
                }
                return '`' + match + '`';
            });
        };

        // Preprocess content based on detected format
        let processedContent = content;

        // Clean up the content by removing unwanted formatting and extra whitespace
        processedContent = processedContent
            // Remove horizontal rules (---)
            .replace(/^---+$/gm, '')
            // Remove standalone ### markers that aren't part of headers
            .replace(/^(#{1,3})(?!\s)/gm, '')
            // Remove extra whitespace (more than 2 consecutive newlines)
            .replace(/\n{3,}/g, '\n\n')
            // Trim whitespace at the beginning and end
            .trim();

        // If no markdown code blocks are detected, try to format plain text code blocks
        if (!containsMarkdownCodeBlocks(processedContent)) {
            processedContent = formatPlainTextCodeBlocks(processedContent);
        }

        // If no inline code is detected, try to format potential inline code
        if (!containsInlineCode(processedContent)) {
            processedContent = formatInlineCode(processedContent);
        }

        // Split content by code blocks
        const parts = processedContent.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                // Extract language and code from code block
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (match) {
                    const [, language, code] = match;
                    const displayLanguage = language || 'python';
                    const trimmedCode = code.trim();
                    const codeBlockId = `code-block-${index}`;

                    return (
                        <Box
                            key={index}
                            sx={{
                                position: 'relative',
                                margin: '1em 0',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.1)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Language label */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.5em 1em',
                                    backgroundColor: '#0b2942',
                                    color: 'white',
                                    fontSize: '0.8em',
                                    fontFamily: 'monospace'
                                }}
                            >
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    {displayLanguage}
                                </Typography>
                                <Tooltip title={copiedCode === index ? "Copied!" : "Copy code"}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopyCode(trimmedCode, index)}
                                        sx={{ color: 'white' }}
                                    >
                                        {copiedCode === index ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Code content */}
                            <SyntaxHighlighter
                                id={codeBlockId}
                                language={displayLanguage}
                                style={winterIsComingTheme}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: '0 0 8px 8px',
                                    padding: '1em',
                                    fontSize: '0.9em',
                                    backgroundColor: '#011627'
                                }}
                                wrapLines={true}
                                showLineNumbers={false}
                            >
                                {trimmedCode}
                            </SyntaxHighlighter>
                        </Box>
                    );
                }
            }

            // For bot messages, apply enhanced styling with markdown conversion
            // Check if the part contains a Markdown table
            const containsTable = /\|(.+)\|[\r\n]+\|([\s-:]+\|)+[\r\n]+\|/.test(part);

            if (containsTable) {
                // Process the table
                const tableHtml = processMarkdownTable(part);
                return (
                    <Typography
                        key={index}
                        variant="body1"
                        dangerouslySetInnerHTML={{ __html: tableHtml }}
                        sx={{
                            whiteSpace: 'normal', // Allow tables to wrap properly
                            lineHeight: 1.6,
                            '& table, & .markdown-table': {
                                borderCollapse: 'collapse',
                                width: '100%',
                                margin: '1em 0',
                                fontSize: '0.9em',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                                boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid #ddd',
                                tableLayout: 'fixed'
                            },
                            '& th': {
                                backgroundColor: '#f8f9fa',
                                color: '#333',
                                fontWeight: 'bold',
                                padding: '10px',
                                textAlign: 'left',
                                borderBottom: '2px solid #ddd',
                                borderRight: '1px solid #ddd',
                                wordWrap: 'break-word',
                                hyphens: 'auto'
                            },
                            '& td': {
                                padding: '8px 10px',
                                borderBottom: '1px solid #ddd',
                                borderRight: '1px solid #ddd',
                                color: '#333',
                                wordWrap: 'break-word',
                                hyphens: 'auto'
                            },
                            '& tr:nth-of-type(even)': {
                                backgroundColor: '#f8f9fa'
                            },
                            '& tr:hover': {
                                backgroundColor: '#f1f1f1'
                            },
                            '& th:last-child, & td:last-child': {
                                borderRight: 'none'
                            },
                            '& code': {
                                backgroundColor: '#f0f0f0',
                                padding: '0.2em 0.4em',
                                borderRadius: '3px',
                                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                fontSize: '0.9em',
                                color: '#e83e8c'
                            },
                            '& pre.code-block': {
                                margin: '0.5em 0',
                                padding: '0',
                                backgroundColor: 'transparent',
                                overflow: 'hidden'
                            },
                            '& pre.code-block code': {
                                display: 'block',
                                padding: '0.8em',
                                backgroundColor: '#1e1e1e',
                                color: '#f8f8f2',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                fontSize: '0.85em',
                                lineHeight: '1.4'
                            }
                        }}
                    />
                );
            }

            // Check for code blocks that might not be properly formatted with triple backticks
            let processedPart = part;

            // Look for patterns that might be code blocks (indented blocks or language indicators)
            const pythonCodePattern = /python\s*\n([\s\S]+?)(?:\n\s*\n|$)/;
            const codeMatch = processedPart.match(pythonCodePattern);

            if (codeMatch) {
                // This looks like a code block that wasn't properly formatted
                const [fullMatch, codeContent] = codeMatch;
                const formattedCode = `<pre class="code-block"><code class="language-python">${codeContent.trim()}</code></pre>`;
                processedPart = processedPart.replace(fullMatch, formattedCode);
            }

            // Convert inline code (text between backticks) - use non-greedy matching
            processedPart = processedPart.replace(/`([^`]+?)`/g, '<code>$1</code>');

            // Convert bold text (text between double asterisks) - use non-greedy matching
            const processedBold = processedPart.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

            // Convert italic text (text between single asterisks) - use non-greedy matching
            const processedItalic = processedBold.replace(/\*([^*]+?)\*/g, '<em>$1</em>');

            // Convert headers (lines starting with # or ##)
            // Adjust heading levels to make sub-points smaller
            const processedHeaders = processedItalic.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
                // Map heading levels to appropriate sizes
                // For sub-points like 3.1, 3.2 (usually h3 or h4), make them smaller
                let level = hashes.length;

                // Ensure sub-headings (h3+) are appropriately sized
                if (level >= 3) {
                    level = Math.min(level + 1, 6); // Increase level (smaller size) but max at h6
                }

                return `<h${level}>${text}</h${level}>`;
            });

            return (
                <Typography
                    key={index}
                    variant="body1"
                    dangerouslySetInnerHTML={{ __html: processedHeaders }}
                    sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                        '& code': {
                            backgroundColor: '#f0f0f0',
                            padding: '0.2em 0.4em',
                            borderRadius: '3px',
                            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            fontSize: '0.9em',
                            color: '#e83e8c'
                        },
                        '& strong': {
                            fontWeight: 600,
                            color: '#0366d6'
                        },
                        '& em': {
                            fontStyle: 'italic',
                            color: '#6f42c1'
                        },
                        '& h1': {
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            margin: '1rem 0 0.5rem 0',
                            color: '#24292e'
                        },
                        '& h2': {
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            margin: '1rem 0 0.5rem 0',
                            color: '#24292e'
                        },
                        '& h3': {
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            margin: '0.75rem 0 0.5rem 0',
                            color: '#24292e'
                        },
                        '& h4': {
                            fontSize: '1rem',
                            fontWeight: 600,
                            margin: '0.75rem 0 0.5rem 0',
                            color: '#24292e'
                        },
                        '& h5': {
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            margin: '0.75rem 0 0.5rem 0',
                            color: '#24292e'
                        },
                        '& h6': {
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            margin: '0.75rem 0 0.5rem 0',
                            color: '#24292e'
                        },
                        '& pre.code-block': {
                            margin: '0.5em 0',
                            padding: '0',
                            backgroundColor: 'transparent',
                            overflow: 'hidden'
                        },
                        '& pre.code-block code': {
                            display: 'block',
                            padding: '0.8em',
                            backgroundColor: '#011627',
                            color: '#d6deeb',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            fontSize: '0.85em',
                            lineHeight: '1.4'
                        }
                    }}
                />
            );
        });
    };

    return (
        <Box
            ref={chatContainerRef}
            sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: '#f9f9f9',
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                borderRadius: 2,
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                    '&:hover': {
                        background: '#555',
                    },
                },
            }}
        >
            <AnimatePresence>
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ textAlign: 'center', marginTop: '2rem' }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            Start a conversation by typing a message or clicking the send button with the learning settings
                        </Typography>
                    </motion.div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        mb: 3,
                                        flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                                    }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                                                mr: message.type === 'user' ? 0 : 1,
                                                ml: message.type === 'user' ? 1 : 0,
                                                boxShadow: 2,
                                            }}
                                        >
                                            {message.type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                                        </Avatar>
                                    </motion.div>

                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 2,
                                            backgroundColor: message.type === 'user' ? '#e3f2fd' : '#ffffff',
                                            maxWidth: '75%',
                                            borderRadius: 2,
                                            borderTopLeftRadius: message.type === 'user' ? 2 : 0,
                                            borderTopRightRadius: message.type === 'user' ? 0 : 2,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        {/* Message label for bot responses */}
                                        {message.type === 'bot' && (
                                            <Box
                                                sx={{
                                                    mb: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                                    pb: 1
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: 'secondary.main',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Python Learning Assistant
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Message content */}
                                        {renderMessageContent(message.content)}

                                        {/* Response time indicator */}
                                        {message.type === 'bot' && message.responseTime && (
                                            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Chip
                                                    size="small"
                                                    label={`Response time: ${message.responseTime}s`}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            </motion.div>
                        ))}
                        {streamingMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        mb: 3,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: 'secondary.main',
                                                mr: 1,
                                                boxShadow: 2,
                                            }}
                                        >
                                            <SmartToyIcon />
                                        </Avatar>
                                    </motion.div>

                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 2,
                                            backgroundColor: '#ffffff',
                                            maxWidth: '75%',
                                            borderRadius: 2,
                                            borderTopLeftRadius: 0,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        {/* Message label for streaming response */}
                                        <Box
                                            sx={{
                                                mb: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderBottom: '1px solid rgba(0,0,0,0.08)',
                                                pb: 1
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: 'secondary.main',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Python Learning Assistant
                                            </Typography>
                                        </Box>

                                        {/* Streaming message content */}
                                        {renderMessageContent(streamingMessage)}

                                        {/* Generating indicator */}
                                        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Chip
                                                size="small"
                                                label="Generating..."
                                                color="secondary"
                                                variant="outlined"
                                                icon={<CircularProgress size={16} />}
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                    </Paper>
                                </Box>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
            <div ref={messagesEndRef} />

            {/* Scroll to bottom button - appears when user has scrolled up and there's new content */}
            <Zoom in={userHasScrolled && !isNearBottom && (messages.length > 0 || streamingMessage)}>
                <Fab
                    color="primary"
                    size="small"
                    aria-label="scroll back to bottom"
                    onClick={() => {
                        scrollToBottom();
                        setUserHasScrolled(false);
                        setIsNearBottom(true);
                    }}
                    sx={{
                        position: 'sticky',
                        bottom: 16,
                        right: 16,
                        alignSelf: 'flex-end',
                        boxShadow: 3,
                    }}
                >
                    <KeyboardArrowDownIcon />
                </Fab>
            </Zoom>

            {/* Copy notification */}
            <Snackbar
                open={showCopyNotification}
                autoHideDuration={2000}
                onClose={() => setShowCopyNotification(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{
                        width: '100%',
                        boxShadow: 3
                    }}
                >
                    Code copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chatbot;