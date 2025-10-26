"use client";

import { Slide } from "@/types";
import DownloadButtons from "./DownloadButtons";

interface SlidePreviewProps {
  slides: Slide[];
  onDownloadPPT: () => void;
  onDownloadPDF: () => void;
}

export default function SlidePreview({
  slides,
  onDownloadPPT,
  onDownloadPDF,
}: SlidePreviewProps) {
  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">Your presentation will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 text-green-600"></div>
        <DownloadButtons
          onDownloadPPT={onDownloadPPT}
          onDownloadPDF={onDownloadPDF}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="w-full aspect-video flex flex-col items-center justify-center p-8 text-white relative"
                style={{
                  backgroundColor: slide.backgroundColor || "#6B7B7F",
                }}
              >
                {slide.image && (
                  <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-800 rounded-lg" />
                  </div>
                )}
                <div
                  className={
                    slide.image
                      ? "ml-auto mr-4 md:mr-8 max-w-[55%] md:max-w-[60%]"
                      : "text-center max-w-full px-4"
                  }
                >
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 wrap-break-words">
                    {slide.title}
                  </h2>
                  {slide.content && (
                    <div className="text-sm md:text-base lg:text-lg opacity-90 wrap-break-words">
                      {slide.content}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                Slide {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
