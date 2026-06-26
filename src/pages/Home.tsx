import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-foreground border-l-3 border-brand pl-2.5 mb-3">
      {children}
    </h2>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [credits, setCredits] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allOptionsFilled = options.every((o) => o.trim() !== "");

  const addOption = () => {
    if (!allOptionsFilled) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o);

    if (!trimmedTitle) {
      setError("タイトルを入力してください");
      return;
    }
    if (trimmedOptions.length < 2) {
      setError("選択肢を2つ以上入力してください");
      return;
    }
    if (credits < 1) {
      setError("クレジットは1以上にしてください");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          options: trimmedOptions,
          credits_per_voter: credits,
        }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const { id } = await res.json();
      navigate(`/${id}`);
    } catch {
      setError("投票の作成に失敗しました");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-brand tracking-tight mb-1">投票さん</h1>
      <hr className="border-brand/30 mb-8" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <SectionHeader>タイトル</SectionHeader>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="局ご飯どこにする？"
            className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-300 focus:border-brand transition-colors duration-150"
          />
        </div>

        <div>
          <SectionHeader>選択肢</SectionHeader>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={["百香亭", "えん弥"][i] ?? `${i + 1}`}
                  className="flex-1 border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-300 focus:border-brand transition-colors duration-150"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="relative size-5 text-slate-300 hover:text-red-400 transition-colors duration-150 after:absolute after:top-1/2 after:left-1/2 after:size-10 after:-translate-1/2"
                    aria-label="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            disabled={!allOptionsFilled}
            className="relative mt-3 text-sm text-brand hover:text-brand-dark disabled:text-slate-300 disabled:cursor-not-allowed transition-colors duration-150 after:absolute after:top-1/2 after:left-1/2 after:size-10 after:-translate-1/2"
            aria-label="選択肢を追加"
          >
            ＋
          </button>
        </div>

        <div>
          <SectionHeader>クレジット数</SectionHeader>
          <p className="text-xs text-slate-400 mb-2">k票投じるには k&sup2; クレジットが必要</p>
          <input
            type="number"
            min={1}
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            className="w-20 border-b border-slate-300 bg-transparent px-1 py-2 text-sm tabular-nums outline-none focus:border-brand transition-colors duration-150"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 animate-fade-in">{error}</p>
        )}

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-48 h-48 rounded-full bg-brand text-white text-lg font-bold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40"
          >
            {submitting ? "作成中..." : "投票を作成"}
          </button>
        </div>
      </form>
    </main>
  );
}
