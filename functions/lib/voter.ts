export async function deriveVoterId(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "";
  const raw = `${ip}:${ua}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const arr = new Uint8Array(buf);
  return Array.from(arr.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}
