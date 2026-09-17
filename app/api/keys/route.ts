import { NextResponse } from "next/server";
import { getLenderKey, setLenderKey } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { generateLenderKeypair } from "@/lib/qr";
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

export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  let key = await getLenderKey(address);
  if (!key) {
    const keypair = await generateLenderKeypair();
    key = {
      ownerAddress: address,
      publicKeyHex: keypair.publicKeyHex,
      privateKeyHexEncrypted: encrypt(keypair.privateKeyHex)
    };
    await setLenderKey(key);
  }
  
  return NextResponse.json({ publicKeyHex: key.publicKeyHex });
}
