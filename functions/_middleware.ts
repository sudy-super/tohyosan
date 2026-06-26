interface Env {
  DB: D1Database;
}

const CRAWLER_RE =
  /Twitterbot|facebookexternalhit|LinkedInBot|LINE|Slackbot|Discordbot|Googlebot|bingbot/i;

const SESSION_ID_RE = /^\/([a-z0-9]{6,12})$/;

export const onRequest: PagesFunction<Env> = async (context) => {
  const ua = context.request.headers.get("user-agent") || "";
  const url = new URL(context.request.url);
  const match = url.pathname.match(SESSION_ID_RE);

  if (!CRAWLER_RE.test(ua) || !match) {
    return context.next();
  }

  const sessionId = match[1];
  const session = await context.env.DB.prepare(
    "SELECT title FROM sessions WHERE id = ?"
  )
    .bind(sessionId)
    .first<{ title: string }>();

  if (!session) {
    return context.next();
  }

  const ogImage = `${url.origin}/api/sessions/${sessionId}/ogp.svg`;
  const pageUrl = `${url.origin}/${sessionId}`;
  const title = escapeHtml(session.title);

  return new Response(
    `<!DOCTYPE html>
<html prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8"/>
<meta property="og:title" content="${title} - 投票さん"/>
<meta property="og:description" content="Quadratic Votingで公平に投票しよう"/>
<meta property="og:image" content="${ogImage}"/>
<meta property="og:url" content="${pageUrl}"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title} - 投票さん"/>
<meta name="twitter:image" content="${ogImage}"/>
</head>
<body></body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
