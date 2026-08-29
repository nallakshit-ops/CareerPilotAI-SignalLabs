"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Loader2,
  Download,
  Sparkles,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function ATSResumeButton({
  resumeText,
  jobDescription,
  missingSkills,
}) {
  const [generating, setGenerating] = useState(false);
  const [atsResume, setAtsResume] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const generateATSResume = async () => {
    if (!resumeText || !jobDescription) {
      toast.error("Resume and job description are required");
      return;
    }

    setGenerating(true);
    setPdfReady(false);

    try {
      const res = await fetch("/api/generate-ats-resume-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          missingSkills: missingSkills || [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAtsResume(data);
        setPdfReady(true);
        toast.success("Premium ATS resume generated!");
      } else {
        toast.error(data.error || "Failed to generate resume");
      }
    } catch (error) {
      toast.error("Failed to generate ATS resume");
    } finally {
      setGenerating(false);
    }
  };

  // Convert base64 string to Blob in chunks to avoid memory spikes
  function base64ToBlob(base64, contentType = "application/pdf") {
    // Validate and fix padding — base64 length must be divisible by 4
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    // Validate that the string only contains valid base64 characters
    if (!/^[A-Za-z0-9+/=]+$/.test(padded)) {
      throw new Error(
        "Received invalid PDF data from server. Please try generating again."
      );
    }

    const sliceSize = 1024;
    const byteCharacters = atob(padded);
    const bytesLength = byteCharacters.length;
    const slices = [];

    for (let offset = 0; offset < bytesLength; offset += sliceSize) {
      const slice = byteCharacters.slice(
        offset,
        Math.min(offset + sliceSize, bytesLength),
      );
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      slices.push(new Uint8Array(byteNumbers));
    }

    return new Blob(slices, { type: contentType });
  }

  const downloadPDF = () => {
    if (!atsResume || !atsResume.pdfBase64) return;

    (async () => {
      try {
        // Normalize and strip data URI if present
        let b64 = String(atsResume.pdfBase64 || "");
        const commaIndex = b64.indexOf(",");
        if (b64.startsWith("data:") && commaIndex !== -1) {
          b64 = b64.slice(commaIndex + 1);
        }
        b64 = b64.replace(/\s+/g, "");
        b64 = b64.replace(/-/g, "+").replace(/_/g, "/");

        const blob = base64ToBlob(b64, "application/pdf");

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = atsResume.filename || "ATS_Optimized_Resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast.success("Premium PDF downloaded!");
      } catch (error) {
        console.error("PDF download error:", error);
        toast.error("Failed to download PDF");
      }
    })();
  };

  const previewPDF = async () => {
    if (!atsResume || !atsResume.pdfBase64) return;

    try {
      let b64 = String(atsResume.pdfBase64 || "");
      const commaIndex = b64.indexOf(",");
      if (b64.startsWith("data:") && commaIndex !== -1) {
        b64 = b64.slice(commaIndex + 1);
      }
      b64 = b64.replace(/\s+/g, "");
      b64 = b64.replace(/-/g, "+").replace(/_/g, "/");

      const blob = base64ToBlob(b64, "application/pdf");
      const url = URL.createObjectURL(blob);
      // Open in new tab for preview
      window.open(url, "_blank");
      // Keep track for cleanup
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (error) {
      console.error("PDF preview error:", error);
      toast.error("Failed to preview PDF");
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const addedSkillsCount = missingSkills?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Plus className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Add Missing Skills Feature</p>
          <p className="text-xs text-muted-foreground">
            {addedSkillsCount > 0
              ? `${addedSkillsCount} skills will be intelligently incorporated into your resume`
              : "No missing skills detected"}
          </p>
        </div>
      </div>

      <Button
        onClick={generateATSResume}
        disabled={generating || !resumeText || !jobDescription}
        className="w-full"
        size="lg"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Premium PDF Resume...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate ATS-Optimized PDF Resume
          </>
        )}
      </Button>

      {pdfReady && atsResume && (
        <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Check className="w-5 h-5" />
              Premium PDF Resume Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                {atsResume.resumeData.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {atsResume.resumeData.email} • {atsResume.resumeData.phone}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                Professional Summary:
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                {atsResume.resumeData.summary}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                Optimized Skills Included:
              </p>
              <div className="flex flex-wrap gap-1">
                {atsResume.resumeData.skills?.slice(0, 12).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={previewPDF}
                  disabled={!pdfReady}
                  className="w-full"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
                <Button
                  onClick={downloadPDF}
                  disabled={!pdfReady}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-green-500" />
                <span>ATS-Optimized Format</span>
                <Check className="w-3 h-3 text-green-500" />
                <span>Exactly 1 Page</span>
                <Check className="w-3 h-3 text-green-500" />
                <span>Ready to Submit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
