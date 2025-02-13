"use client";

import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Copy, Download, Trash2, RefreshCw } from "lucide-react";

const ClipboardImagePlayground = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(4 / 3);
  const [exportFormat, setExportFormat] = useState("png");
  const [zoom, setZoom] = useState(1);
  const [currentCropRatio, setCurrentCropRatio] = useState<string>("");
  const ZOOM_STEP = 0.1;

  const cropperRef = useRef<any>(null);

  // Global paste support
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => {
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

  // Button-triggered paste (for browsers that support navigator.clipboard.read)
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

  // Update zoom whenever the slider changes
  useEffect(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.zoomTo(zoom);
    }
  }, [zoom]);

  // Update crop box when aspect ratio changes
  useEffect(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(aspectRatio);
      // Force an update of the crop box if needed
      cropperRef.current.cropper.crop();
    }
  }, [aspectRatio]);

  // Update the crop ratio indicator
  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const data = cropperRef.current.cropper.getData();
      if (data.height) {
        const ratio = data.width / data.height;
        setCurrentCropRatio(ratio.toFixed(2));
      }
    }
  };

  // Create an export canvas that includes cropped image and pads it to square if needed.
  // Also, pass fillColor so areas outside the image (black void) are rendered in black.
  const getExportCanvas = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const cropper = cropperRef.current.cropper;
      const croppedCanvas = cropper.getCroppedCanvas({
        fillColor: "black",
      });
      if (!croppedCanvas) return null;
      const width = croppedCanvas.width;
      const height = croppedCanvas.height;
      if (width === height) {
        return croppedCanvas;
      }
      // Create a square canvas with black background and center the cropped image.
      const size = Math.max(width, height);
      const paddedCanvas = document.createElement("canvas");
      paddedCanvas.width = size;
      paddedCanvas.height = size;
      const ctx = paddedCanvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, size, size);
      const dx = (size - width) / 2;
      const dy = (size - height) / 2;
      ctx.drawImage(croppedCanvas, dx, dy, width, height);
      return paddedCanvas;
    }
    return null;
  };

  // Export the cropped image as a file
  const handleExport = () => {
    const canvas = getExportCanvas();
    if (!canvas) return;
    canvas.toBlob(
      (blob: Blob | null) => {
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

  // Copy the cropped image to clipboard
  const handleCopy = async () => {
    if (cropperRef.current && navigator.clipboard.write) {
      const canvas = getExportCanvas();
      if (!canvas) return;
      canvas.toBlob(async (blob: Blob | null) => {
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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, 0.5));
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
              value={aspectRatio?.toString() ?? "free"}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "free") {
                  setAspectRatio(undefined);
                } else {
                  setAspectRatio(parseFloat(value));
                }
              }}
              className="px-2 py-1 border rounded-md bg-white"
            >
              <option value="free">Free</option>
              <option value="1">1:1</option>
              <option value="1.3333333333333333">4:3</option>
              <option value="1.7777777777777777">16:9</option>
              <option value="1.5">3:2</option>
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
          <div className="relative h-full w-full bg-black">
            <Cropper
              src={imageSrc}
              ref={cropperRef}
              // Use the proper event name ("crop" not "onCrop")
              crop={handleCrop}
              style={{ height: "100%", width: "100%" }}
              aspectRatio={aspectRatio}
              guides={true}
              background={false}
              viewMode={0} // Allow crop box to extend into the black void.
              autoCropArea={1}
              responsive={true}
              checkOrientation={false}
              dragMode="move"
              cropBoxMovable={true}
              cropBoxResizable={true}
              toggleDragModeOnDblclick={false}
              minContainerWidth={100}
              minContainerHeight={100}
              center={true}
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
        {imageSrc && (
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Zoom:</span>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-100"
                disabled={zoom <= 0.5}
              >
                -
              </button>
              <input
                type="range"
                min={0.5}
                max={3}
                step={ZOOM_STEP}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-32"
              />
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-100"
                disabled={zoom >= 3}
              >
                +
              </button>
              <span className="text-sm text-gray-600 min-w-[3ch]">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Current Crop Ratio: {currentCropRatio || "N/A"}
            </div>
          </div>
        )}

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
