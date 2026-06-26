interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env, "id"> = async (context) => {
  const db = context.env.DB;
  const id = context.params.id as string;
  const body = await context.request.json<{
    voter_id: string;
    allocations: { option_id: number; num_votes: number }[];
  }>();

  const { voter_id, allocations } = body;

  if (!voter_id || typeof voter_id !== "string") {
    return Response.json({ error: "voter_id required" }, { status: 400 });
  }
  if (!Array.isArray(allocations)) {
    return Response.json({ error: "allocations required" }, { status: 400 });
  }

  const session = await db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .bind(id)
    .first<{ credits_per_voter: number }>();

  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await db
    .prepare("SELECT id FROM ballots WHERE session_id = ? AND voter_id = ?")
    .bind(id, voter_id)
    .first();

  if (existing) {
    return Response.json({ error: "Already voted" }, { status: 409 });
  }

  const { results: validOptions } = await db
    .prepare("SELECT id FROM options WHERE session_id = ?")
    .bind(id)
    .all<{ id: number }>();

  const validIds = new Set(validOptions.map((o) => o.id));
  let totalCredits = 0;

  for (const alloc of allocations) {
    if (!validIds.has(alloc.option_id)) {
      return Response.json({ error: "Invalid option" }, { status: 400 });
    }
    const v = Math.round(alloc.num_votes);
    totalCredits += v * v;
  }

  if (totalCredits > session.credits_per_voter) {
    return Response.json({ error: "Credit budget exceeded" }, { status: 400 });
  }

  const ballotId = crypto.randomUUID();
  const itemStatements = allocations
    .filter((a) => a.num_votes !== 0)
    .map((a) =>
      db
        .prepare(
          "INSERT INTO ballot_items (ballot_id, option_id, num_votes, credits_spent) VALUES (?, ?, ?, ?)"
        )
        .bind(
          ballotId,
          a.option_id,
          Math.round(a.num_votes),
          Math.round(a.num_votes) * Math.round(a.num_votes)
        )
    );

  await db.batch([
    db
      .prepare("INSERT INTO ballots (id, session_id, voter_id) VALUES (?, ?, ?)")
      .bind(ballotId, id, voter_id),
    ...itemStatements,
  ]);

  return Response.json({ ok: true });
};
