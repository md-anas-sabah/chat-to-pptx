"use client";

import { Download } from "lucide-react";

interface DownloadButtonsProps {
  onDownloadPPT: () => void;
  onDownloadPDF: () => void;
}

export default function DownloadButtons({
  onDownloadPPT,
  onDownloadPDF,
}: DownloadButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDownloadPDF}
        className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors"
        title="Download as PDF"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">PDF</span>
      </button>
      <button
        onClick={onDownloadPPT}
        className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors"
        title="Download as PPTX"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">PPTX</span>
      </button>
    </div>
  );
}
