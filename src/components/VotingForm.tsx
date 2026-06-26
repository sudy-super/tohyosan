import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Option {
  id: number;
  label: string;
  position: number;
}

interface Props {
  sessionId: string;
  sessionTitle: string;
  options: Option[];
  creditsPerVoter: number;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-foreground border-l-3 border-brand pl-2.5">
      {children}
    </h2>
  );
}

export default function VotingForm({
  sessionId,
  sessionTitle,
  options,
  creditsPerVoter,
}: Props) {
  const navigate = useNavigate();
  const [votes, setVotes] = useState<Record<number, number>>(() =>
    Object.fromEntries(options.map((o) => [o.id, 0]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const totalCreditsUsed = Object.values(votes).reduce(
    (sum, v) => sum + v * v,
    0
  );
  const remainingCredits = creditsPerVoter - totalCreditsUsed;

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/vote/check`)
      .then((r) => r.json())
      .then((data) => {
        if (data.voted) setAlreadyVoted(true);
      })
      .catch(() => {});
  }, [sessionId]);

  const canIncrement = useCallback(
    (optionId: number) => {
      const current = votes[optionId] || 0;
      const next = current + 1;
      const additionalCost = next * next - current * current;
      return remainingCredits >= additionalCost;
    },
    [votes, remainingCredits]
  );

  const canDecrement = (optionId: number) => (votes[optionId] || 0) > 0;

  const increment = (optionId: number) => {
    if (!canIncrement(optionId)) return;
    setVotes((prev) => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
  };

  const decrement = (optionId: number) => {
    if (!canDecrement(optionId)) return;
    setVotes((prev) => ({ ...prev, [optionId]: (prev[optionId] || 0) - 1 }));
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    const allocations = options.map((o) => ({
      option_id: o.id,
      num_votes: votes[o.id] || 0,
    }));

    try {
      const res = await fetch(`/api/sessions/${sessionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          setAlreadyVoted(true);
          return;
        }
        throw new Error(data.error || "Vote failed");
      }

      navigate(`/${sessionId}/results`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "投票に失敗しました");
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnyVotes = Object.values(votes).some((v) => v > 0);

  return (
    <div className="w-full max-w-lg mx-auto px-5 py-8">
      <h1 className="text-xl font-bold mb-1">{sessionTitle}</h1>
      <hr className="border-brand/30 mb-6" />

      <div className="flex items-center gap-2 mb-8 text-xs text-slate-400">
        <span className="truncate">{shareUrl}</span>
        <button
          onClick={copyLink}
          className="relative shrink-0 font-bold text-accent hover:text-accent/80 transition-colors duration-150 after:absolute after:top-1/2 after:left-1/2 after:size-10 after:-translate-1/2"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>

      {alreadyVoted ? (
        <div className="text-center py-12 animate-fade-in">
          <svg className="w-16 h-16 text-brand mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-bold mb-8">投票済みです</p>
          <a
            href={`/${sessionId}/results`}
            className="inline-block w-40 h-40 leading-[10rem] rounded-full bg-brand text-white text-base font-bold transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            結果を見る
          </a>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader>選択肢</SectionHeader>
              <span className="text-sm">
                <span className="text-lg font-extrabold tabular-nums text-accent">{remainingCredits}</span>
                <span className="text-slate-400">/{creditsPerVoter}</span>
              </span>
            </div>

            <div className="space-y-1">
              {options.map((option) => {
                const v = votes[option.id] || 0;
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between py-3 border-b border-slate-100"
                  >
                    <span className="font-medium text-sm text-slate-700">
                      {option.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => decrement(option.id)}
                        disabled={!canDecrement(option.id)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-150 active:not-disabled:scale-[0.96]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-lg font-extrabold tabular-nums">
                        {v}
                      </span>
                      <button
                        onClick={() => increment(option.id)}
                        disabled={!canIncrement(option.id)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full text-brand hover:text-brand-dark hover:bg-brand-light disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-150 active:not-disabled:scale-[0.96]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {error && (
              <p className="text-sm text-red-500 animate-fade-in">{error}</p>
            )}
            {showConfirm ? (
              <div className="animate-fade-in text-center space-y-4">
                <p className="text-sm text-slate-500">
                  投票は一度送信すると修正できません。
                  {remainingCredits > 0 && (
                    <span className="block text-accent font-medium mt-1">
                      未使用のクレジットが {remainingCredits} 残っています。
                    </span>
                  )}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="w-28 h-28 rounded-full bg-slate-200 text-slate-500 font-bold text-sm transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-36 h-36 rounded-full bg-accent text-white font-bold text-base transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40"
                  >
                    {submitting ? "送信中..." : "確定する"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!hasAnyVotes}
                  className="w-44 h-44 rounded-full bg-brand text-white text-lg font-bold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-30"
                >
                  投票する
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
