import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { getLenderKey, setLenderKey, hasDb } from "@/lib/db";
import { generateLenderKeypair, createReturnPayload, signReturn } from "@/lib/qr";
import * as crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || "0e67de05b40fce79b7099a9542bd273deb2cbeb9e0fa8d4462935b2775ac8147", "hex");

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decrypt(encryptedText: string) {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");
  const authTag = Buffer.from(parts[2], "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });
  
  const { escrowId } = await req.json();
  if (!escrowId) return NextResponse.json({ error: "escrowId required" }, { status: 400 });

  let key = await getLenderKey(address);
  let privKeyHex = "";
  if (!key) {
    const keypair = await generateLenderKeypair();
    privKeyHex = keypair.privateKeyHex;
    key = {
      ownerAddress: address,
      publicKeyHex: keypair.publicKeyHex,
      privateKeyHexEncrypted: encrypt(privKeyHex)
    };
    await setLenderKey(key);
  } else {
    privKeyHex = decrypt(key.privateKeyHexEncrypted);
  }
  
  const payload = createReturnPayload(escrowId);
  const token = await signReturn(payload, privKeyHex);
  
  return NextResponse.json({ token, publicKeyHex: key.publicKeyHex });
}
