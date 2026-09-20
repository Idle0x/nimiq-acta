"use client";

import { useEffect } from "react";
import { installAuthFetchPatch } from "@/lib/auth-client";

export default function AuthInit() {
  useEffect(() => {
    installAuthFetchPatch();
  }, []);
  return null;
}
