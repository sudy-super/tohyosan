interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const db = context.env.DB;
  const id = context.params.id as string;

  const session = await db
    .prepare("SELECT title FROM sessions WHERE id = ?")
    .bind(id)
    .first<{ title: string }>();

  const title = session?.title ?? "投票";

  const lines = splitTitle(title, 16);
  const fontSize = lines.length > 2 ? 44 : 56;
  const lineHeight = fontSize * 1.4;
  const startY = 280 - ((lines.length - 1) * lineHeight) / 2;

  const titleElements = lines
    .map(
      (line, i) =>
        `<text x="600" y="${startY + i * lineHeight}" text-anchor="middle" font-family="'Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans JP',sans-serif" font-size="${fontSize}" font-weight="bold" fill="#333">${escapeXml(line)}</text>`
    )
    .join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#69B040"/>
  <rect x="36" y="36" width="1128" height="558" rx="12" fill="white"/>
  ${titleElements}
  <text x="600" y="540" text-anchor="middle" font-family="'Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans JP',sans-serif" font-size="30" font-weight="bold" fill="#69B040">投票さん</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

function splitTitle(title: string, maxChars: number): string[] {
  if (title.length <= maxChars) return [title];
  const lines: string[] = [];
  for (let i = 0; i < title.length; i += maxChars) {
    lines.push(title.slice(i, i + maxChars));
  }
  return lines.slice(0, 3);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
