"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Download, Trash2, WrapText, AlignJustify } from "lucide-react";

const ClipboardPlayground = () => {
  const [text, setText] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [statistics, setStatistics] = useState({
    lines: 0,
    words: 0,
    characters: 0,
  });

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateStatistics(text);
  }, [text]);

  const updateStatistics = (content: string) => {
    const lines = content.split("\n").length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    setStatistics({ lines, words, characters });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText((prev) => prev + clipboardText);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "v") {
      e.preventDefault();
      navigator.clipboard.readText().then((clipText) => {
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const currentText = text;
        const newText =
          currentText.substring(0, start) +
          clipText +
          currentText.substring(end);
        setText(newText);
        // Set cursor position after paste
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = start + clipText.length;
            textareaRef.current.selectionStart = newPosition;
            textareaRef.current.selectionEnd = newPosition;
          }
        }, 0);
      });
    }
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

  const formatText = () => {
    setText(text.trim().replace(/\n{3,}/g, "\n\n"));
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
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
          >
            <WrapText className="w-4 h-4" />
            {wordWrap ? "Disable" : "Enable"} Wrap
          </button>
          <button
            onClick={formatText}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
          >
            <AlignJustify className="w-4 h-4" />
            Format
          </button>
        </div>
      </div>

      <div className="flex-grow border rounded-lg overflow-hidden">
        <div className="flex h-full relative">
          {showLineNumbers && (
            <div className="w-12 flex-shrink-0 bg-gray-50 overflow-hidden relative z-10">
              <div ref={lineNumbersRef} className="h-full overflow-y-hidden">
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className={`px-2 text-sm font-mono text-gray-400 leading-6 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    {i + 1}
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
              onPaste={(e) => {
                e.preventDefault();
                const clipText = e.clipboardData.getData("text");
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const currentText = text;
                const newText =
                  currentText.substring(0, start) +
                  clipText +
                  currentText.substring(end);
                setText(newText);
                // Set cursor position after paste
                setTimeout(() => {
                  if (textareaRef.current) {
                    const newPosition = start + clipText.length;
                    textareaRef.current.selectionStart = newPosition;
                    textareaRef.current.selectionEnd = newPosition;
                  }
                }, 0);
              }}
              className={`w-full h-full p-2 font-mono text-sm resize-none outline-none leading-6 overflow-auto relative z-10 ${
                wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
              }`}
              style={{
                background: lines
                  .map(
                    (_, i) =>
                      `linear-gradient(to bottom, ${
                        i % 2 === 0 ? "#ffffff" : "#f3f4f6"
                      } 0%, ${i % 2 === 0 ? "#ffffff" : "#f3f4f6"} 100%) 0 ${
                        i * 24
                      }px / 100% 24px no-repeat`
                  )
                  .join(","),
              }}
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
