"use client";

import { useCallback, useEffect, useState } from "react";
import { init, requestDeviceIdentifier, getHostLanguage } from "@nimiq/mini-app-sdk";

export const LUNAS_PER_NIM = 100_000;

export type NimiqStatus = "loading" | "connected" | "error";

type SendArgs = {
  recipient: string;
  value: number;
  fee?: number;
};

type SendDataArgs = SendArgs & { data: string };

interface SignatureResult { publicKey: string; signature: string; }
interface ErrorResponse { error: { type: string; message: string; }; }


export function useNimiq() {
  const [status, setStatus] = useState<NimiqStatus>("loading");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [provider, setProvider] = useState<Awaited<ReturnType<typeof init>> | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [hostLanguage, setHostLanguage] = useState<string | null>(null);
  const [isConsensus, setIsConsensus] = useState<boolean>(false);
  const [blockNumber, setBlockNumber] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await init({ timeout: 2500 });
        if (cancelled) return;
        setProvider(p);
        
        try {
          const lang = getHostLanguage();
          if (!cancelled && typeof lang === 'string') setHostLanguage(lang);
        } catch {
          // ignore
        }

        try {
          const deviceResp = await requestDeviceIdentifier({
            reason: "Acta uses device identity for trust scoring and anti-spam.",
          });
          if (!cancelled && typeof deviceResp === 'string') {
             setDeviceId(deviceResp);
          }
        } catch {
          // user denied or not in Nimiq Pay
        }

        try {
          const accs = await p.listAccounts();
          if (!cancelled) {
            if (Array.isArray(accs)) {
              setAccounts(accs);
            } else if (accs && typeof accs === 'object' && 'error' in accs) {
              setAccounts([]);
            }
          }
        } catch {
          if (!cancelled) setAccounts([]);
        }
        
        if (!cancelled) setStatus("connected");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "connected" || !provider) return;
    
    let cancelled = false;
    
    async function pollConsensus() {
      if (cancelled || !provider) return;
      try {
        const consensus = await provider.isConsensusEstablished();
        if (!cancelled && typeof consensus === 'boolean') {
          setIsConsensus(consensus);
        }
        
        if (consensus) {
          const bn = await provider.getBlockNumber();
          if (!cancelled && typeof bn === 'number') {
            setBlockNumber(bn);
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) {
        setTimeout(pollConsensus, 30000);
      }
    }
    
    pollConsensus();
    
    return () => {
      cancelled = true;
    };
  }, [provider, status]);

  const connected = status === "connected";

  const sendLock = useCallback(
    async (args: SendArgs): Promise<string> => {
      if (!provider || status !== "connected") {
        throw new Error("Nimiq Pay is not connected");
      }
      const res = await provider.sendBasicTransaction({
        recipient: args.recipient,
        value: args.value,
        fee: args.fee ?? 10,
      });
      if (typeof res === "string") return res;
      throw new Error(
        `Nimiq send failed: ${(res as ErrorResponse)?.error?.message ?? "unknown error"}`
      );
    },
    [provider, status]
  );
  
  const sendWithData = useCallback(
    async (args: SendDataArgs): Promise<string> => {
      if (!provider || status !== "connected") {
        throw new Error("Nimiq Pay is not connected");
      }
      const res = await provider.sendBasicTransactionWithData({
        recipient: args.recipient,
        value: args.value,
        fee: args.fee ?? 10,
        data: args.data,
      });
      if (typeof res === "string") return res;
      throw new Error(
        `Nimiq sendWithData failed: ${(res as ErrorResponse)?.error?.message ?? "unknown error"}`
      );
    },
    [provider, status]
  );

  const signMessage = useCallback(
    async (message: string | { message: string; isHex?: boolean }): Promise<SignatureResult> => {
      if (!provider || status !== "connected") {
        throw new Error("Nimiq Pay is not connected");
      }
      const res = await provider.sign(message);
      if (res && 'publicKey' in res && 'signature' in res) return res as SignatureResult;
      throw new Error(
        `Nimiq sign failed: ${(res as ErrorResponse)?.error?.message ?? "unknown error"}`
      );
    },
    [provider, status]
  );

  return { status, connected, accounts, deviceId, hostLanguage, isConsensus, blockNumber, sendLock, sendWithData, signMessage };
}

export function nimToLunas(nim: number) {
  return Math.round(nim * LUNAS_PER_NIM);
}
