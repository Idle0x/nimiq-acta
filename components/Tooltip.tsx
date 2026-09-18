"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, HelpCircle } from "lucide-react";

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  title,
  position = "top",
  className = "",
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const posClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }
        }}
        className="cursor-pointer inline-flex items-center"
      >
        {children || (
          <span className="p-1 text-[var(--ink3)] hover:text-[var(--gold)] transition-colors inline-flex items-center">
            <Info size={13} />
          </span>
        )}
      </div>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 max-w-[85vw] p-3 rounded-xl border border-[var(--gold)]/35 bg-[#181208]/95 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.45)] text-[11px] leading-relaxed text-[var(--ink2)] animate-fade-in pointer-events-auto ${posClasses}`}
        >
          {title && (
            <div className="font-bold text-[var(--gold)] uppercase tracking-wider text-[9px] mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              {title}
            </div>
          )}
          <div>{content}</div>
        </div>
      )}
    </div>
  );
}

export function InfoTooltip({
  title,
  content,
  position = "top",
  className = "",
  size = 13,
}: {
  title?: string;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  size?: number;
}) {
  return (
    <Tooltip title={title} content={content} position={position} className={className}>
      <span className="p-1 rounded-full text-[var(--ink3)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors inline-flex items-center justify-center">
        <Info size={size} />
      </span>
    </Tooltip>
  );
}
