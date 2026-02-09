"use client";

import { useState, useEffect } from "react";

const LINES = [
  "Initializing workspace...",
  "Fetching your cards and tags...",
  "Organizing columns...",
  "Almost there...",
  "Ready.",
];

interface LoadingScreenProps {
  onFinished: () => void;
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([""]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const isFinished = lineIndex >= LINES.length;

  useEffect(() => {
    if (lineIndex >= LINES.length) return;

    const currentLine = LINES[lineIndex];

    if (charIndex < currentLine.length) {
      const speed = 25 + Math.random() * 40;
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[lineIndex] = currentLine.slice(0, charIndex + 1);
          return updated;
        });
        setCharIndex((i) => i + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Pause between lines
      const pause = 300 + Math.random() * 200;
      const timeout = setTimeout(() => {
        setLineIndex((i) => i + 1);
        setCharIndex(0);
        if (lineIndex < LINES.length - 1) {
          setDisplayedLines((prev) => [...prev, ""]);
        }
      }, pause);
      return () => clearTimeout(timeout);
    }
  }, [lineIndex, charIndex]);

  useEffect(() => {
    if (isFinished) {
      const timeout = setTimeout(onFinished, 600);
      return () => clearTimeout(timeout);
    }
  }, [isFinished, onFinished]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
      <div className="flex flex-col items-start gap-1 max-w-md">
        {/* Pulsing dots */}
        <div className="flex gap-1.5 mb-4 self-center">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1s_ease-in-out_infinite]" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_1s_ease-in-out_0.4s_infinite]" />
        </div>

        {/* Typed lines */}
        {displayedLines.map((line, i) => (
          <div
            key={i}
            className={`font-mono tracking-wide text-base ${
              i === displayedLines.length - 1 && !isFinished
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            <span className="text-indigo-500 mr-2">›</span>
            {line}
            {i === displayedLines.length - 1 && !isFinished && (
              <span className="inline-block w-[2px] h-[1.1em] bg-gray-300 align-text-bottom ml-0.5 animate-blink" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
