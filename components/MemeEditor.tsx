"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@instantdb/react";
import TemplateLoader from "./TemplateLoader";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/fileStorage";
import {
  canvasToBlob,
  drawText,
  initializeTextPositions,
  validateImageFile,
} from "@/lib/memeUtils";

type TextPosition = "top" | "center" | "bottom";

interface MemeEditorProps {
  memeId?: string;
  onSave?: () => void;
}

interface TextProperties {
  x: number;
  y: number;
  color: string;
  rotation: number;
  fontSize: number;
}

interface MemeTextState {
  top: string;
  center: string;
  bottom: string;
}

interface MemeTextPropsState {
  top: TextProperties;
  center: TextProperties;
  bottom: TextProperties;
}

const defaultTextProps = (): MemeTextPropsState => ({
  top: { x: 0, y: 0, color: "#ffffff", rotation: 0, fontSize: 48 },
  center: { x: 0, y: 0, color: "#ffffff", rotation: 0, fontSize: 42 },
  bottom: { x: 0, y: 0, color: "#ffffff", rotation: 0, fontSize: 48 },
});

export default function MemeEditor({ memeId, onSave }: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedText, setSelectedText] = useState<TextPosition>("top");
  const [textValues, setTextValues] = useState<MemeTextState>({
    top: "TOP TEXT",
    center: "",
    bottom: "BOTTOM TEXT",
  });
  const [textProperties, setTextProperties] = useState<MemeTextPropsState>(
    defaultTextProps()
  );

  const { user } = db.useAuth();

  const hasImage = Boolean(imageUrl);

  const selectedProps = useMemo(
    () => textProperties[selectedText],
    [selectedText, textProperties]
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    drawText(
      ctx,
      textValues.top,
      textProperties.top.x,
      textProperties.top.y,
      textProperties.top.color,
      textProperties.top.rotation,
      textProperties.top.fontSize,
      canvas.width
    );
    drawText(
      ctx,
      textValues.center,
      textProperties.center.x,
      textProperties.center.y,
      textProperties.center.color,
      textProperties.center.rotation,
      textProperties.center.fontSize,
      canvas.width
    );
    drawText(
      ctx,
      textValues.bottom,
      textProperties.bottom.x,
      textProperties.bottom.y,
      textProperties.bottom.color,
      textProperties.bottom.rotation,
      textProperties.bottom.fontSize,
      canvas.width
    );
  }, [textValues, textProperties]);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const nextProps = defaultTextProps();
      initializeTextPositions(
        nextProps,
        img.naturalWidth || img.width,
        img.naturalHeight || img.height,
        nextProps.top.fontSize
      );
      setTextProperties(nextProps);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [drawCanvas, imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file)) {
      alert("Please select a valid image file under 10MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleTemplateSelect = (url: string) => {
    setImageUrl(url);
  };

  const handleTextChange = (value: string) => {
    setTextValues((prev) => ({
      ...prev,
      [selectedText]: value,
    }));
  };

  const updateSelectedProp = (prop: keyof TextProperties, value: number | string) => {
    setTextProperties((prev) => ({
      ...prev,
      [selectedText]: {
        ...prev[selectedText],
        [prop]: value,
      },
    }));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save memes.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "meme.png", { type: "image/png" });
      const fileId = await uploadFile(file);
      const title = prompt("Enter a title for your meme:") || "Untitled Meme";
      const isPublic = confirm("Make this meme public?");

      const id =
        memeId || `meme_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      await db.transact(
        tx.memes[id].update({
          userId: user.id,
          title,
          imageFileId: fileId,
          topText: textValues.top,
          topX: textProperties.top.x,
          topY: textProperties.top.y,
          topColor: textProperties.top.color,
          topRotation: textProperties.top.rotation,
          topFontSize: textProperties.top.fontSize,
          centerText: textValues.center,
          centerX: textProperties.center.x,
          centerY: textProperties.center.y,
          centerColor: textProperties.center.color,
          centerRotation: textProperties.center.rotation,
          centerFontSize: textProperties.center.fontSize,
          bottomText: textValues.bottom,
          bottomX: textProperties.bottom.x,
          bottomY: textProperties.bottom.y,
          bottomColor: textProperties.bottom.color,
          bottomRotation: textProperties.bottom.rotation,
          bottomFontSize: textProperties.bottom.fontSize,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          isPublic,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      );

      alert("Meme saved successfully!");
      onSave?.();
    } catch (error) {
      console.error("Error saving meme:", error);
      alert("Failed to save meme. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      <div className="canvas-wrapper">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            className={`meme-canvas ${hasImage ? "show" : ""}`}
          />
        </div>
      </div>

      <div className="bottom-toolbar">
        <div className="toolbar-section">
          <div className="toolbar-group">
            <label className="toolbar-label" htmlFor="image-upload">
              Upload:
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <TemplateLoader onTemplateSelect={handleTemplateSelect} />
        </div>

        <div className="toolbar-section text-section">
          <div className="text-tabs">
            {(["top", "center", "bottom"] as TextPosition[]).map((pos) => (
              <button
                key={pos}
                className={`text-tab ${selectedText === pos ? "active" : ""}`}
                onClick={() => setSelectedText(pos)}
              >
                {pos.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="text-panel active">
            <div className="toolbar-input-group">
              <textarea
                value={textValues[selectedText]}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text"
              />
            </div>
            <div className="toolbar-input-group compact">
              <label htmlFor="text-color">Color</label>
              <input
                id="text-color"
                type="color"
                value={selectedProps.color}
                onChange={(e) => updateSelectedProp("color", e.target.value)}
              />
            </div>
            <div className="toolbar-input-group compact">
              <label htmlFor="font-size">Size</label>
              <input
                id="font-size"
                className="compact-range"
                type="range"
                min={16}
                max={120}
                value={selectedProps.fontSize}
                onChange={(e) =>
                  updateSelectedProp("fontSize", Number(e.target.value))
                }
              />
              <span className="value-display">{selectedProps.fontSize}</span>
            </div>
            <div className="toolbar-input-group compact">
              <label htmlFor="rotation">Rotate</label>
              <input
                id="rotation"
                className="compact-range"
                type="range"
                min={-45}
                max={45}
                value={selectedProps.rotation}
                onChange={(e) =>
                  updateSelectedProp("rotation", Number(e.target.value))
                }
              />
              <span className="value-display">{selectedProps.rotation}</span>
            </div>
          </div>
        </div>

        <div className="toolbar-section">
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!hasImage}
          >
            Download
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!hasImage || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
