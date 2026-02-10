"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";

interface TemplateLoaderProps {
  onTemplateSelect: (imageUrl: string) => void;
}

export default function TemplateLoader({ onTemplateSelect }: TemplateLoaderProps) {
  const { data } = db.useQuery({
    templates: {
      $: {
        where: {},
      },
    },
  });

  const templates = data?.templates || [];

  // Fallback to local templates if database is empty
  const localTemplates = [
    { id: "local-1", name: "Revenge", imageFileId: "/assets/revenge.jpg" },
    { id: "local-2", name: "Success Kid", imageFileId: "/assets/successkid.jpg" },
  ];

  const allTemplates = templates.length > 0 ? templates : localTemplates;

  const getImageUrl = (template: any) => {
    if (template.imageFileId?.startsWith("/")) {
      // Local template
      return template.imageFileId;
    }
    // Database template - use file storage helper
    const { getFileUrl } = require("@/lib/fileStorage");
    return getFileUrl(template.imageFileId);
  };

  return (
    <div className="templates-group">
      <span className="toolbar-label">Templates:</span>
      <div className="templates-mini">
        {allTemplates.map((template: any) => (
          <button
            key={template.id}
            className="template-mini-item"
            type="button"
            onClick={() => onTemplateSelect(getImageUrl(template))}
            aria-label={`Template: ${template.name}`}
          >
            <img src={getImageUrl(template)} alt={template.name} />
          </button>
        ))}
      </div>
    </div>
  );
}
