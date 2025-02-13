"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Download,
  Trash2,
  WrapText,
  AlignJustify,
  Type,
} from "lucide-react";

const LINE_HEIGHT = 24;

const ClipboardPlayground = () => {
  const [text, setText] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [relativeLineNumbers, setRelativeLineNumbers] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [statistics, setStatistics] = useState({
    lines: 0,
    words: 0,
    characters: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineNumbersContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateStatistics(text);
  }, [text]);

  const updateStatistics = (content: string) => {
    const lines = content.split("\n").length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    setStatistics({ lines, words, characters });
  };

  const updateCurrentLine = () => {
    if (textareaRef.current) {
      const { selectionStart, value } = textareaRef.current;
      const lines = value.substr(0, selectionStart).split("\n");
      setCurrentLine(lines.length);
    }
  };

  const getRelativeLineNumber = (index: number) => {
    const diff = index + 1 - currentLine;
    if (diff === 0) return currentLine;
    return Math.abs(diff);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    updateCurrentLine();
    setTimeout(ensureCursorVisible, 0);
  };

  const syncScroll = (scrollTop: number) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = scrollTop;
    }
    if (lineNumbersContainerRef.current) {
      lineNumbersContainerRef.current.scrollTop = scrollTop;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    syncScroll(newScrollTop);
  };

  const ensureCursorVisible = () => {
    if (!textareaRef.current || !containerRef.current) return;

    const textarea = textareaRef.current;
    const { selectionStart, value } = textarea;
    const lines = value.substring(0, selectionStart).split("\n");
    const currentLineNumber = lines.length;

    // Calculate cursor position
    const cursorY = (currentLineNumber - 1) * LINE_HEIGHT;
    const visibleHeight = containerRef.current.clientHeight;
    const scrollTop = textarea.scrollTop;

    // Add padding to keep cursor away from edges
    const VERTICAL_PADDING = LINE_HEIGHT * 2;

    // Adjust scroll position if cursor is too high or too low
    if (cursorY < scrollTop + VERTICAL_PADDING) {
      // Cursor is too high
      const newScrollTop = Math.max(0, cursorY - VERTICAL_PADDING);
      syncScroll(newScrollTop);
    } else if (cursorY > scrollTop + visibleHeight - VERTICAL_PADDING * 2) {
      // Cursor is too low
      const newScrollTop = cursorY - visibleHeight + VERTICAL_PADDING * 3;
      syncScroll(newScrollTop);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "v") {
      e.preventDefault();
      handlePaste();
    }
    // Use requestAnimationFrame for smoother cursor tracking
    requestAnimationFrame(() => {
      updateCurrentLine();
      ensureCursorVisible();
    });
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText((prev) => prev + clipboardText);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = text.length + clipboardText.length;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          updateCurrentLine();
          ensureCursorVisible();
        }
      });
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleSelectionChange = () => {
    updateCurrentLine();
    ensureCursorVisible();
  };

  const handleClick = () => {
    updateCurrentLine();
    ensureCursorVisible();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText("");
  };

  const lines = text.split("\n");

  return (
    <div className="flex flex-col h-[90vh] w-full p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-mono">Clipboard Playground</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
          >
            <AlignJustify className="w-4 h-4" />
            {showLineNumbers ? "Hide" : "Show"} Numbers
          </button>
          {showLineNumbers && (
            <button
              onClick={() => setRelativeLineNumbers(!relativeLineNumbers)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
            >
              <Type className="w-4 h-4" />
              {relativeLineNumbers ? "Absolute" : "Relative"} Numbers
            </button>
          )}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
          >
            <WrapText className="w-4 h-4" />
            {wordWrap ? "Disable" : "Enable"} Wrap
          </button>
        </div>
      </div>

      <div
        className="flex-grow border rounded-lg overflow-hidden"
        ref={containerRef}
      >
        <div className="flex h-full relative">
          {showLineNumbers && (
            <div
              ref={lineNumbersContainerRef}
              className="w-12 flex-shrink-0 bg-gray-50 overflow-y-scroll relative z-10 scrollbar-hide"
            >
              <div className="py-2">
                {lines.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: LINE_HEIGHT,
                      lineHeight: `${LINE_HEIGHT}px`,
                    }}
                    className={`px-2 text-sm font-mono ${
                      i + 1 === currentLine
                        ? "text-blue-600 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {relativeLineNumbers ? getRelativeLineNumber(i) : i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="relative flex-grow overflow-hidden">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              onClick={handleClick}
              onSelect={handleSelectionChange}
              style={{
                lineHeight: `${LINE_HEIGHT}px`,
                padding: "8px",
                tabSize: 2,
              }}
              className={`w-full h-full font-mono text-sm resize-none outline-none overflow-y-scroll relative z-10 bg-white ${
                wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
              }`}
              placeholder="Paste your text here or start typing..."
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Lines: {statistics.lines}</span>
          <span>Words: {statistics.words}</span>
          <span>Characters: {statistics.characters}</span>
          <span>Current Line: {currentLine}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Paste
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClipboardPlayground;
