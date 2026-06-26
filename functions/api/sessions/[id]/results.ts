interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const db = context.env.DB;
  const id = context.params.id as string;

  const session = await db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .bind(id)
    .first();

  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { results: options } = await db
    .prepare(
      `SELECT o.id, o.label, o.position,
              COALESCE(SUM(bi.num_votes), 0) as total_votes
       FROM options o
       LEFT JOIN ballot_items bi ON bi.option_id = o.id
       WHERE o.session_id = ?
       GROUP BY o.id
       ORDER BY o.position`
    )
    .bind(id)
    .all();

  const voterCount = await db
    .prepare("SELECT COUNT(*) as count FROM ballots WHERE session_id = ?")
    .bind(id)
    .first<{ count: number }>();

  return Response.json({
    session,
    options,
    voter_count: voterCount?.count ?? 0,
  });
};
