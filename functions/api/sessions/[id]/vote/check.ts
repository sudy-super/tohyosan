interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const db = context.env.DB;
  const id = context.params.id as string;
  const url = new URL(context.request.url);
  const voterId = url.searchParams.get("voter_id");

  if (!voterId) {
    return Response.json({ voted: false });
  }

  const ballot = await db
    .prepare("SELECT id FROM ballots WHERE session_id = ? AND voter_id = ?")
    .bind(id, voterId)
    .first();

  return Response.json({ voted: !!ballot });
};
