import { deriveVoterId } from "../../../../lib/voter";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const db = context.env.DB;
  const id = context.params.id as string;
  const voterId = await deriveVoterId(context.request);

  const ballot = await db
    .prepare("SELECT id FROM ballots WHERE session_id = ? AND voter_id = ?")
    .bind(id, voterId)
    .first();

  return Response.json({ voted: !!ballot });
};
