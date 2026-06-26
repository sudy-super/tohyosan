import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

interface ResultOption {
  id: number;
  label: string;
  position: number;
  total_votes: number;
}

interface SessionResults {
  session: { id: string; title: string; credits_per_voter: number };
  options: ResultOption[];
  voter_count: number;
}

const VOTER_KEY_PREFIX = "qv_voter_";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<SessionResults | null>(null);

  useEffect(() => {
    const voterId = localStorage.getItem(VOTER_KEY_PREFIX + id);
    if (!voterId) {
      navigate(`/${id}`, { replace: true });
      return;
    }

    fetch(`/api/sessions/${id}/vote/check?voter_id=${voterId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.voted) {
          navigate(`/${id}`, { replace: true });
          return;
        }
        return fetch(`/api/sessions/${id}/results`);
      })
      .then((r) => r?.json())
      .then((data) => {
        if (data) setResults(data);
      })
      .catch(() => navigate(`/${id}`, { replace: true }));
  }, [id, navigate]);

  if (!results) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <span className="text-sm text-slate-400 animate-pulse">読み込み中...</span>
      </main>
    );
  }

  const maxVotes = Math.max(
    ...results.options.map((o) => Math.abs(o.total_votes)),
    1
  );

  const sorted = [...results.options].sort(
    (a, b) => b.total_votes - a.total_votes
  );

  return (
    <main className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">
      <h1 className="text-xl font-bold mb-1">{results.session.title}</h1>
      <p className="text-sm text-slate-400 mb-1">
        {results.voter_count}人が投票
      </p>
      <hr className="border-brand/30 mb-6" />

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <tbody>
            {sorted.map((option, i) => {
              const barWidth =
                maxVotes > 0 ? Math.abs(option.total_votes) / maxVotes : 0;

              return (
                <tr
                  key={option.id}
                  className={i > 0 ? "border-t border-slate-100" : ""}
                >
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {option.label}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`text-base font-extrabold tabular-nums ${
                        option.total_votes > 0
                          ? "text-accent"
                          : "text-slate-300"
                      }`}
                    >
                      {option.total_votes}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                        style={{
                          width: `${barWidth * 100}%`,
                          opacity: option.total_votes !== 0 ? 1 : 0,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {results.voter_count === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-400">まだ投票がありません</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 justify-center text-sm">
        <Link
          to={`/${id}`}
          className="text-accent hover:text-accent/80 font-semibold transition-colors duration-150"
        >
          投票ページに戻る
        </Link>
        <span className="text-slate-200">|</span>
        <Link
          to="/"
          className="text-slate-400 hover:text-slate-600 font-medium transition-colors duration-150"
        >
          新しい投票を作成
        </Link>
      </div>
    </main>
  );
}
