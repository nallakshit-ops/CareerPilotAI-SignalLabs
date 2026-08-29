"use client";

import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Download, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { updateCoverLetter } from "@/actions/cover-letter";

const CoverLetterPreview = ({
  coverLetterId,
  content,
  jobTitle,
  companyName,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [editorMode, setEditorMode] = useState("preview");
  const [editorContent, setEditorContent] = useState(content || "");
  const [lastSavedContent, setLastSavedContent] = useState(content || "");

  const {
    loading: isSaving,
    fn: saveCoverLetterFn,
    data: saveResult,
  } = useFetch(updateCoverLetter);

  useEffect(() => {
    setEditorContent(content || "");
    setLastSavedContent(content || "");
  }, [content]);

  useEffect(() => {
    if (saveResult) {
      setLastSavedContent(editorContent);
      toast.success("Cover letter saved successfully!");
    }
  }, [saveResult, editorContent]);

  const isDirty = editorContent.trim() !== lastSavedContent.trim();

  const handleSave = async () => {
    if (!coverLetterId) {
      toast.error("Cover letter id is missing");
      return;
    }

    await saveCoverLetterFn({
      id: coverLetterId,
      content: editorContent,
    });
  };

  const handleDownload = async () => {
    if (!editorContent) return;

    setIsDownloading(true);

    const safeJob = (jobTitle || "cover-letter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const safeCompany = (companyName || "company")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      const sourceElement = document.getElementById("cover-letter-pdf");
      if (!sourceElement) return;

      const options = {
        margin: [12, 12],
        filename: `${safeJob || "cover-letter"}-${safeCompany || "company"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(options).from(sourceElement).save();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="py-4 space-y-3">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!editorContent?.trim() || isSaving || !isDirty}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setEditorMode((prev) => (prev === "preview" ? "edit" : "preview"))
          }
        >
          {editorMode === "preview" ? "Edit Text" : "Show Preview"}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!editorContent || isDownloading}
          variant="outline"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>
      <MDEditor
        value={editorContent}
        onChange={(value) => setEditorContent(value || "")}
        preview={editorMode}
        height={700}
      />
      <div className="hidden">
        <div id="cover-letter-pdf">
          <MDEditor.Markdown
            source={editorContent}
            style={{ background: "white", color: "black", padding: "20px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
