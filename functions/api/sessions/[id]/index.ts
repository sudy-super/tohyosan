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
    .prepare("SELECT * FROM options WHERE session_id = ? ORDER BY position")
    .bind(id)
    .all();

  return Response.json({ ...session, options });
};
