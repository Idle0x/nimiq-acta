"use client";
// Backward-compat shim: old toast(msg, type) API over the new Feedback system.
// New code should import { ToastProvider, useToast } from "@/components/Feedback".
import {
  ToastProvider as FeedbackProvider,
  useToast as useFeedbackToast,
} from "@/components/Feedback";
import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export function ToastProvider({ children }: { children: ReactNode }) {
  return <FeedbackProvider>{children}</FeedbackProvider>;
}

export const useToast = () => {
  const push = useFeedbackToast();
  const toast = (message: string, type: ToastType = "info") =>
    push({ type, title: message });
  return { toast, push };
};
