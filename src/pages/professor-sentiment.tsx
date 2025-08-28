import { useState } from 'react';

type SentimentLabel = 'positive' | 'negative' | 'neutral';

type ResultItem = {
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  breakdown: {
    positive_words: string[];
    negative_words: string[];
    total_words: number;
  };
};

type ApiData = {
  professor: string;
  totalComments: number;
  numRatings: number;
  overall_score: number;
  overall_label: SentimentLabel;
  blended_overall?: number;
  blended_label?: SentimentLabel;
  counts: { positive: number; negative: number; neutral: number; total: number };
  results: ResultItem[];
  meta?: { limit?: number; sinceMonths?: number; avgRating?: number; wouldTakeAgainPercent?: number };
};

function sentimentEmoji(label: SentimentLabel) {
  return label === 'positive' ? '😊' : label === 'negative' ? '😖' : '😐';
}

function badgeClasses(label: SentimentLabel) {
  // vivid colors that read well on glass/dark surfaces
  switch (label) {
    case 'positive':
      return 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40';
    case 'negative':
      return 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40';
    default:
      return 'bg-amber-400/25 text-amber-100 ring-1 ring-amber-300/40';
  }
}

export default function ProfessorSentiment() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [limit, setLimit] = useState<number>(100);
  const [sinceMonths, setSinceMonths] = useState<number | ''>('');
  const [blend, setBlend] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ApiData | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const qs = new URLSearchParams({
        profFirst: first.trim(),
        profLast: last.trim(),
        limit: String(limit),
        blend: String(blend),
      });
      if (sinceMonths) qs.set('sinceMonths', String(sinceMonths));
      const r = await fetch(`/api/professor-sentiment?${qs.toString()}`);
      const j = await r.json();
      if (j.message !== 'success') throw new Error(j.error || 'Failed');
      setData(j.data);
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const counts = data?.counts;

  return (
    <div className="relative min-h-screen text-white">
      {/* gradient background like the landing page */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#0a0a2a] via-[#1a0f5a] to-[#3b1b1b]" />
      {/* subtle radial glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 -z-10 h-96 w-96 rounded-full bg-indigo-700/30 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-orange-600/25 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-16 space-y-8">
        {/* Header / hero */}
        <div className="space-y-3">
          <div className="text-xs tracking-widest text-indigo-200/80 uppercase">Powered by Nebula Labs</div>
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-sm">
            UTD Trends — <span className="text-indigo-200">Professor Sentiment</span>
          </h1>
          <p className="max-w-2xl text-indigo-100/80">
            Analyze recent RateMyProfessors comments, blend with star ratings, and get a quick read of sentiment.
          </p>
        </div>

        {/* Controls bar (glass) */}
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 shadow-xl shadow-black/30">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-sm text-indigo-100/80 mb-1">First name</label>
              <input
                className="rounded-xl border border-white/10 bg-white/10 text-white px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="e.g. John"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-indigo-100/80 mb-1">Last name</label>
              <input
                className="rounded-xl border border-white/10 bg-white/10 text-white px-3 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="e.g. Cole"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-indigo-100/80 mb-1">Comment limit</label>
              <input
                type="number"
                min={1}
                max={250}
                className="rounded-xl border border-white/10 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                value={limit}
                onChange={(e) =>
                  setLimit(Math.max(1, Math.min(250, Number(e.target.value) || 100)))
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-indigo-100/80 mb-1">Since (months, optional)</label>
              <input
                type="number"
                min={1}
                max={120}
                className="rounded-xl border border-white/10 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                value={sinceMonths}
                onChange={(e) =>
                  setSinceMonths(e.target.value ? Number(e.target.value) : '')
                }
              />
            </div>
            <label className="inline-flex items-center gap-2 select-none">
              <input
                id="blend"
                type="checkbox"
                className="h-4 w-4 accent-indigo-400"
                checked={blend}
                onChange={(e) => setBlend(e.target.checked)}
              />
              <span className="text-sm text-indigo-100/80">Blend with star rating</span>
            </label>

            <div className="md:col-span-5">
              <button
                onClick={run}
                disabled={!first || !last || loading}
                className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 font-semibold shadow-lg shadow-indigo-900/50 disabled:opacity-50"
              >
                {loading ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-4 h-1 w-full bg-white/10 rounded overflow-hidden">
              <div className="h-1 w-1/3 animate-pulse bg-indigo-300/70" />
            </div>
          )}
          {err && (
            <div className="mt-3 rounded-xl bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/30 px-3 py-2 text-sm">
              {err}
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 shadow-lg shadow-black/30">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold drop-shadow">{data.professor}</h2>
                  <span className="text-xs rounded-full bg-white/10 px-2 py-1">{data.totalComments} comments</span>
                  <span className="text-xs rounded-full bg-white/10 px-2 py-1">{data.numRatings} ratings</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 items-center">
                  <div className={`px-3 py-2 rounded-xl ${badgeClasses(data.overall_label)}`}>
                    <div className="text-[10px] tracking-widest uppercase opacity-80">Comments sentiment</div>
                    <div className="text-lg font-extrabold flex items-baseline gap-2">
                      <span>{sentimentEmoji(data.overall_label)} {data.overall_label}</span>
                      <span className="font-normal opacity-80">({data.overall_score})</span>
                    </div>
                  </div>

                  {typeof data.blended_overall === 'number' && data.blended_label && (
                    <div className={`px-3 py-2 rounded-xl ${badgeClasses(data.blended_label)}`}>
                      <div className="text-[10px] tracking-widest uppercase opacity-80">Blended</div>
                      <div className="text-lg font-extrabold flex items-baseline gap-2">
                        <span>{sentimentEmoji(data.blended_label)} {data.blended_label}</span>
                        <span className="font-normal opacity-80">({data.blended_overall})</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-sm text-indigo-100/80 flex gap-4 flex-wrap">
                  {typeof data.meta?.avgRating === 'number' && (
                    <span>RMP avg rating: <b className="text-white">{data.meta.avgRating.toFixed(1)}/5</b></span>
                  )}
                  {typeof data.meta?.wouldTakeAgainPercent === 'number' && (
                    <span>Would take again: <b className="text-white">{Math.round(data.meta.wouldTakeAgainPercent)}%</b></span>
                  )}
                  {typeof data.meta?.sinceMonths === 'number' && (
                    <span>Window: last <b className="text-white">{data.meta.sinceMonths}</b> months</span>
                  )}
                </div>
              </div>

              {/* Distribution bars */}
              {counts && (
                <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 shadow-lg shadow-black/30">
                  <div className="text-base font-semibold mb-2">Distribution</div>
                  {(() => {
                    const max = Math.max(1, counts.positive, counts.neutral, counts.negative);
                    const rows = [
                      { label: 'Positive', value: counts.positive, color: 'bg-emerald-400' },
                      { label: 'Neutral',  value: counts.neutral,  color: 'bg-amber-300' },
                      { label: 'Negative', value: counts.negative, color: 'bg-rose-400' },
                    ];
                    return (
                      <div className="space-y-3">
                        {rows.map((r) => (
                          <div key={r.label} className="flex items-center gap-3">
                            <div className="w-20 text-sm text-indigo-100/80">{r.label}</div>
                            <div className="flex-1 h-3 rounded bg-white/10 overflow-hidden ring-1 ring-white/10">
                              <div
                                className={`h-3 ${r.color}`}
                                style={{ width: `${(r.value / max) * 100}%` }}
                              />
                            </div>
                            <div className="w-10 text-right text-sm tabular-nums text-white">{r.value}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Results list */}
            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/30">
              <div className="px-4 py-3 border-b border-white/10 font-semibold">Analyzed comments (sample)</div>
              <div className="divide-y divide-white/10 max-h-[70vh] overflow-y-auto">
                {data.results.slice(0, 60).map((r, i) => (
                  <div key={i} className="p-3 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded ${badgeClasses(r.sentiment)} text-xs font-semibold`}>
                        {sentimentEmoji(r.sentiment)} {r.sentiment.toUpperCase()}
                      </span>
                      <span className="text-indigo-100">score {r.score}</span>
                      <span className="text-indigo-200/80">conf {r.confidence}</span>
                    </div>
                    <div className="text-indigo-200/80">
                      +{r.breakdown.positive_words.join(', ') || '—'} / -{r.breakdown.negative_words.join(', ') || '—'}
                    </div>
                  </div>
                ))}
                {data.results.length === 0 && (
                  <div className="p-4 text-indigo-100/80">No comments available in this window.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
