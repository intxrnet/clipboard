"use client";

import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Copy, Download, Trash2, RefreshCw } from "lucide-react";

const ClipboardImagePlayground = () => {
  const [imageSrc, setImageSrc] = useState(null);
  // Use a number for aspect ratio; NaN for free crop.
  const [aspectRatio, setAspectRatio] = useState(4 / 3);
  const [exportFormat, setExportFormat] = useState("png");
  // Allow zoom out below 1 (0.5) and zoom in up to 3.
  const [zoom, setZoom] = useState(1);

  const cropperRef = useRef(null);

  // --- Global paste support (Ctrl+V) ---
  useEffect(() => {
    const handlePasteEvent = (e) => {
      if (e.clipboardData) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const url = URL.createObjectURL(blob);
              setImageSrc(url);
              e.preventDefault();
              return;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePasteEvent);
    return () => window.removeEventListener("paste", handlePasteEvent);
  }, []);

  // --- Button-triggered paste (for browsers that support navigator.clipboard.read) ---
  const handlePaste = async () => {
    try {
      if (navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              const url = URL.createObjectURL(blob);
              setImageSrc(url);
              return;
            }
          }
        }
        alert("No image found in clipboard.");
      } else {
        alert(
          "Your browser does not support navigator.clipboard.read(). Please use Ctrl+V."
        );
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  // Update cropper zoom when slider changes
  useEffect(() => {
    if (cropperRef.current) {
      cropperRef.current.cropper.zoomTo(zoom);
    }
  }, [zoom]);

  // Computes padding in pixels when zoomed out (< 1).
  const computePadding = () => {
    return zoom < 1 ? (1 - zoom) * 50 : 0; // adjust the multiplier as needed
  };

  // Helper to get the cropped canvas with black padding (if any)
  const getExportCanvas = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedCanvas = cropper.getCroppedCanvas();
      if (!croppedCanvas) return null;
      const paddingPx = computePadding();
      if (paddingPx > 0) {
        const newCanvas = document.createElement("canvas");
        newCanvas.width = croppedCanvas.width + 2 * paddingPx;
        newCanvas.height = croppedCanvas.height + 2 * paddingPx;
        const ctx = newCanvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.drawImage(croppedCanvas, paddingPx, paddingPx);
        return newCanvas;
      }
      return croppedCanvas;
    }
    return null;
  };

  // --- Export the cropped image with padding (if any) ---
  const handleExport = () => {
    const canvas = getExportCanvas();
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cropped-image.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      `image/${exportFormat}`,
      exportFormat === "jpg" ? 0.92 : 1
    );
  };

  // --- Copy the cropped image with padding to clipboard ---
  const handleCopy = async () => {
    if (cropperRef.current && navigator.clipboard.write) {
      const canvas = getExportCanvas();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          alert("Cropped image copied to clipboard.");
        } catch (err) {
          console.error("Failed to copy image:", err);
        }
      }, `image/${exportFormat}`);
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    setZoom(1);
  };

  return (
    <div className="flex flex-col h-[90vh] w-full p-4 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h1 className="text-2xl font-mono">Clipboard to Image Playground</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 border rounded-md hover:bg-blue-100"
          >
            <RefreshCw className="w-4 h-4" />
            Paste
          </button>
          <label className="text-sm text-gray-600 flex items-center gap-1">
            Aspect Ratio:
            <select
              value={isNaN(aspectRatio) ? "free" : aspectRatio}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "free") {
                  setAspectRatio(NaN);
                } else {
                  setAspectRatio(parseFloat(value));
                }
              }}
              className="px-2 py-1 border rounded-md bg-white"
            >
              <option value="free">Free</option>
              <option value="1">1:1</option>
              <option value={(4 / 3).toString()}>4:3</option>
              <option value={(16 / 9).toString()}>16:9</option>
              <option value={(3 / 2).toString()}>3:2</option>
            </select>
          </label>
          <label className="text-sm text-gray-600 flex items-center gap-1">
            Format:
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-2 py-1 border rounded-md bg-white"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WEBP</option>
            </select>
          </label>
        </div>
      </div>

      {/* Cropper container */}
      <div
        className="flex-grow border rounded-lg overflow-hidden relative"
        style={{ backgroundColor: "black" }}
      >
        {imageSrc ? (
          // Wrap Cropper in a div that adds padding when zoomed out.
          <div
            style={{
              height: "100%",
              width: "100%",
              padding: computePadding(),
              boxSizing: "border-box",
            }}
          >
            <Cropper
              src={imageSrc}
              ref={cropperRef}
              style={{ height: "100%", width: "100%" }}
              aspectRatio={isNaN(aspectRatio) ? NaN : aspectRatio}
              guides={true}
              background={false}
              viewMode={1}
              autoCropArea={1}
              responsive={true}
              checkOrientation={false}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <p>Paste an image from your clipboard or press Ctrl+V.</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Zoom control */}
        {imageSrc && (
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Zoom:
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="ml-2"
            />
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {imageSrc && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border rounded-md hover:bg-gray-100"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border rounded-md hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border rounded-md hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClipboardImagePlayground;
