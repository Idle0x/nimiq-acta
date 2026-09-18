export type OracleKind = "vision" | "qr" | "geo" | "creator";

export interface ListingContract {
  criteria: string;                 // what the proof must show (goes into the AI prompt verbatim)
  deadlineHours: number;            // complete-within window after accepting
  minTrust: number;                 // who may accept (0 = anyone)
  expiresInHours: number;           // how long the listing stays open
  geo?: { lat: number; lng: number; radiusM: number };
  ai: {
    primary: OracleKind;
    presenceCheck: boolean;         // QR/geo: also require an AI-verified photo of the scene
    preScreen: boolean;             // creator: AI recommends, human signs
  };
}

export const DEFAULT_CONTRACT: ListingContract = {
  criteria: "",
  deadlineHours: 72,
  minTrust: 0,
  expiresInHours: 168,
  ai: { primary: "vision", presenceCheck: false, preScreen: true },
};

export function oracleForKind(kind: string): OracleKind {
  if (kind === "bounty_qr") return "qr";
  if (kind === "bounty_geo") return "geo";
  if (kind === "bounty_manual" || kind === "bounty_venture") return "creator";
  return "vision";
}

/** Short, professional protocol lines — used by the dossier and the contract sheet. */
export function protocolNotes(l: { kind: string; collateralNIM: number }, c?: Partial<ListingContract> | null): string[] {
  const fee = "a 0.0011 NIM settlement fee (0.001 retained by the vault, 0.0001 network)";
  const notes: string[] = [];
  switch (l.kind) {
    case "borrow":
      notes.push(
        `${l.collateralNIM.toLocaleString()} NIM locks in the protocol vault for the loan period — held by the contract, not the lender.`,
        `Return the item and have the lender scan your Return Code: the vault releases your collateral minus ${fee}.`,
        "If the item is not returned, the lender may claim the collateral once the window closes."
      );
      break;
    case "bounty_qr":
      notes.push(
        `${l.collateralNIM.toLocaleString()} NIM was locked by the sponsor before this went live — the reward is real and already on-chain.`,
        "A cryptographically signed token is hidden at a physical place. Scanning it with the in-app scanner releases the reward.",
        "The signature cannot be forged or replayed — pure cryptographic proof of presence."
      );
      break;
    case "bounty_manual":
    case "bounty_venture":
      notes.push(
        `${l.collateralNIM.toLocaleString()} NIM sits in the vault, reserved for the first approved submission.`,
        "Submit your proof; the sponsor reviews it from their inbox and approves with one signature.",
        "Unreviewed submissions auto-refund the sponsor after 48h — nobody's funds sit idle."
      );
      break;
    default:
      notes.push(
        `${l.collateralNIM.toLocaleString()} NIM was locked by the sponsor at creation and sits in the vault until someone passes the oracle.`,
        "Complete the task and submit a photo — the vision oracle checks it against the sponsor's criteria and the vault pays out minus " + fee + ".",
        "Failing the check costs nothing — your balance is never at risk."
      );
  }
  if (c?.ai?.presenceCheck)
    notes.push("The AI also verifies a photo of the scene — a forwarded QR or spoofed GPS won't pass.");
  if ((c as any)?.preScreen || c?.ai?.preScreen)
    notes.push("The AI pre-screens every submission and recommends a verdict — the sponsor still signs the release.");
  if (c?.deadlineHours)
    notes.push(`Accepted work must be completed within ${hoursLabel(c.deadlineHours)} — after that the lock auto-refunds.`);
  if (c?.minTrust)
    notes.push(`Only members with trust ≥ ${c.minTrust} may accept this contract.`);
  if (c?.expiresInHours)
    notes.push(`Open for ${hoursLabel(c.expiresInHours)}; unclaimed rewards refund to the sponsor automatically.`);
  return notes;
}

export function hoursLabel(h: number): string {
  if (h < 24) return `${h} hours`;
  if (h % 168 === 0) return `${h / 168} week${h > 168 ? "s" : ""}`;
  if (h % 24 === 0) return `${h / 24} day${h > 24 ? "s" : ""}`;
  return `${h} hours`;
}
