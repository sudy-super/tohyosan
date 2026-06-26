import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VotingForm from "../components/VotingForm";

interface Option {
  id: number;
  session_id: string;
  label: string;
  position: number;
}

interface Session {
  id: string;
  title: string;
  credits_per_voter: number;
  options: Option[];
}

export default function Vote() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setSession)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">投票が見つかりません</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <span className="text-sm text-slate-400 animate-pulse">読み込み中...</span>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <VotingForm
        sessionId={session.id}
        sessionTitle={session.title}
        options={session.options}
        creditsPerVoter={session.credits_per_voter}
      />
    </main>
  );
}
