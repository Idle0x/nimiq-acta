"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

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
  const [coords, setCoords] = useState<{ top: number; left: number; position: "top" | "bottom" } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = Math.min(280, window.innerWidth - 24);

      // Center horizontally on trigger button, clamp strictly within viewport boundaries
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      left = Math.max(12, Math.min(window.innerWidth - tooltipWidth - 12, left));

      // Check vertical space: flip if not enough room on requested side
      const preferTop = position === "top";
      let actualPos: "top" | "bottom" = preferTop ? "top" : "bottom";
      if (preferTop && rect.top < 130) {
        actualPos = "bottom";
      } else if (!preferTop && window.innerHeight - rect.bottom < 130) {
        actualPos = "top";
      }

      const top = actualPos === "top" ? rect.top - 8 : rect.bottom + 8;
      setCoords({ top, left, position: actualPos });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    function handlePointerDown(e: Event) {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, position]);

  return (
    <div
      ref={triggerRef}
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

      {mounted && isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: "min(280px, calc(100vw - 24px))",
            transform: coords.position === "top" ? "translateY(-100%)" : "none",
            zIndex: 999999,
          }}
          className="p-3 rounded-xl border border-[var(--gold)]/40 bg-[#181208]/98 backdrop-blur-md shadow-[0_10px_32px_rgba(0,0,0,0.6)] text-[11px] leading-relaxed text-[var(--ink2)] animate-fade-in pointer-events-auto"
        >
          {title && (
            <div className="font-bold text-[var(--gold)] uppercase tracking-wider text-[9px] mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              {title}
            </div>
          )}
          <div>{content}</div>
        </div>,
        document.body
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
