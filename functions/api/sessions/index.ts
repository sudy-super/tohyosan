interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB;
  const body = await context.request.json<{
    title: string;
    options: string[];
    credits_per_voter?: number;
  }>();

  const { title, options, credits_per_voter } = body;

  if (
    !title ||
    !Array.isArray(options) ||
    options.length < 2 ||
    options.some((o) => typeof o !== "string" || !o.trim())
  ) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const creditsPerVoter =
    typeof credits_per_voter === "number" && credits_per_voter > 0
      ? credits_per_voter
      : 100;

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 8);

  await db.batch([
    db
      .prepare(
        "INSERT INTO sessions (id, title, credits_per_voter) VALUES (?, ?, ?)"
      )
      .bind(id, title.trim(), creditsPerVoter),
    ...options.map((label, i) =>
      db
        .prepare(
          "INSERT INTO options (session_id, label, position) VALUES (?, ?, ?)"
        )
        .bind(id, label.trim(), i)
    ),
  ]);

  return Response.json({ id });
};
