// src/pages/api/professor-sentiment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeSingleComment } from '../../modules/sentiment/sentiment';

// --- helpers -----------------------------------------------------------------

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    // numeric entities like &#8212; (em dash)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// RMP dates look like "2025-03-06 19:36:52 +0000 UTC".
// new Date(dateStr) usually works, but we add a fallback parser to be safe.
function parseRmpDate(dateStr?: string | null): Date | undefined {
  if (!dateStr) return undefined;

  // Try native first
  const d1 = new Date(dateStr);
  if (!Number.isNaN(d1.getTime())) return d1;

  // Fallback: "YYYY-MM-DD HH:mm:ss +0000 UTC" -> ISO
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(dateStr);
  if (m) {
    const [_, Y, M, D, h, mnt, s] = m;
    const iso = `${Y}-${M}-${D}T${h}:${mnt}:${s}Z`;
    const d2 = new Date(iso);
    if (!Number.isNaN(d2.getTime())) return d2;
  }
  return undefined;
}

function parseSinceMonths(v: unknown): number | undefined {
  if (typeof v !== 'string') return undefined;
  const n = parseInt(v, 10);
  if (Number.isFinite(n) && n >= 1 && n <= 120) return n;
  return undefined;
}

// Normalize 1..5 stars -> -1..1 (3 -> 0)
function normalizeStars(x?: number): number | undefined {
  if (typeof x !== 'number' || !Number.isFinite(x)) return undefined;
  return Math.max(-1, Math.min(1, (x - 3) / 2));
}

// --- types -------------------------------------------------------------------

type ScraperResp = {
  message: string;
  data?: {
    firstName: string;
    lastName: string;
    numRatings: number;
    avgRating?: number;                 // 1..5
    wouldTakeAgainPercent?: number;     // 0..100
    teacherRatingTags?: { tagName: string; tagCount: number }[];
    ratings?: {
      edges?: {
        node?: {
          comment?: string | null;
          wouldTakeAgain?: number | null; // 1 | 0 | null
          date?: string | null;
        }
      }[]
    };
  };
};

type SentimentResult = ReturnType<typeof analyzeSingleComment>;

type Out =
  | {
      message: 'success';
      data: {
        professor: string;
        totalComments: number;
        numRatings: number;
        overall_score: number;
        overall_label: 'positive' | 'negative' | 'neutral';
        blended_overall?: number;
        blended_label?: 'positive' | 'negative' | 'neutral';
        counts: { positive: number; negative: number; neutral: number; total: number };
        results: SentimentResult[];
        meta: {
          limit: number;
          sinceMonths?: number;
          avgRating?: number;
          wouldTakeAgainPercent?: number;
        };
      };
    }
  | { message: 'error'; error: string };

// --- route -------------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse<Out>) {
  const { profFirst, profLast, limit, sinceMonths, blend } = req.query;

  if (typeof profFirst !== 'string' || typeof profLast !== 'string') {
    res.status(400).json({ message: 'error', error: 'Missing profFirst/profLast' });
    return;
  }

  try {
    // Build base URL that works in dev/prod behind proxies
    const host = req.headers.host || 'localhost:3000';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
    const baseUrl = `${proto}://${host}`;

    // Call existing scraper
    const u = new URL('/api/ratemyprofessorScraper', baseUrl);
    u.searchParams.set('profFirst', profFirst.split(' ')[0]); // scraper expects first token
    u.searchParams.set('profLast', profLast);

    const r = await fetch(u.toString(), { headers: { accept: 'application/json' } });
    const json: ScraperResp = await r.json();

    if (json.message !== 'success' || !json.data) {
      res.status(404).json({ message: 'error', error: 'Professor not found or scraper failed' });
      return;
    }

    // --- collect & filter comments ------------------------------------------
    const cap = Math.max(1, Math.min(Number(limit ?? 250), 250));
    const months = parseSinceMonths(sinceMonths);

    const now = new Date();
    const cutoff = months
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, now.getUTCDate()))
      : undefined;

    const edges = json.data.ratings?.edges ?? [];
    const items = edges
      .map(e => {
        const raw = (e.node?.comment ?? '').trim();
        const comment = decodeEntities(raw).replace(/\s+/g, ' ').trim();
        const wouldTakeAgain = e.node?.wouldTakeAgain ?? null;
        const parsedDate = parseRmpDate(e.node?.date ?? undefined);
        return { comment, wouldTakeAgain, parsedDate };
      })
      .filter(i => i.comment.length > 0)
      .filter(i => (cutoff ? (i.parsedDate ? i.parsedDate >= cutoff : false) : true))
      .slice(0, cap);

    // --- analyze comments ----------------------------------------------------
    const analyzed: SentimentResult[] = items.map(i => analyzeSingleComment(i.comment));

    // Weight per comment: small tilt using wouldTakeAgain (±10%)
    const weighted: SentimentResult[] = analyzed.map((r, idx) => {
      const wta = items[idx].wouldTakeAgain;
      const factor = wta === 1 ? 1.1 : wta === 0 ? 0.9 : 1.0;
      const newScore = Math.max(-1, Math.min(1, Math.round(r.score * factor * 100) / 100));
      return { ...r, score: newScore }; // keep label/confidence as-is (optional: recompute label if you want)
    });

    // --- aggregate -----------------------------------------------------------
    const avg = weighted.reduce((a, r) => a + r.score, 0) / Math.max(1, weighted.length);

    // Tag-based negative nudge (uses RMP tags to bias overall slightly negative if community flags)
    const NEG_TAGS = new Set([
      'Tough grader', 'Test heavy', 'Lots of homework', 'Graded by few things',
      'Beware of pop quizzes', 'Tests are tough', 'Lecture heavy'
    ]);
    const tagNudgeRaw = (json.data.teacherRatingTags ?? []).reduce((sum, t) => {
      const name = (t.tagName || '').trim();
      if (NEG_TAGS.has(name)) {
        const cnt = Math.min(1, Math.max(0, t.tagCount || 0)); // presence → 0.01
        return sum + cnt * 0.01;
      }
      return sum;
    }, 0);
    const tagNudge = Math.max(-0.2, Math.min(0, -tagNudgeRaw)); // cap total nudge to -0.2
    const avgWithTags = avg + tagNudge;

    // Lower decision threshold → more decisive
    const THRESH = 0.05;
    const overall_score = Math.round(avgWithTags * 100) / 100;
    const overall_label: 'positive' | 'negative' | 'neutral' =
      overall_score > THRESH ? 'positive' : overall_score < -THRESH ? 'negative' : 'neutral';

    const counts = {
      positive: weighted.filter(r => r.sentiment === 'positive').length,
      negative: weighted.filter(r => r.sentiment === 'negative').length,
      neutral:  weighted.filter(r => r.sentiment === 'neutral').length,
      total: weighted.length,
    };

    // --- optional blend with stars + wouldTakeAgain% ------------------------
    let blended_overall: number | undefined;
    let blended_label: 'positive' | 'negative' | 'neutral' | undefined;

    if (String(blend).toLowerCase() === 'true') {
      const starNorm = normalizeStars(json.data.avgRating);
      const wtaPct = typeof json.data.wouldTakeAgainPercent === 'number'
        ? Math.max(0, Math.min(100, json.data.wouldTakeAgainPercent))
        : undefined;
      // map 0..100 → -0.2..+0.2 (centered at 50%)
      const wtaNudge = typeof wtaPct === 'number' ? (wtaPct / 100) * 0.4 - 0.2 : 0;

      // 70% comments, 30% stars, then nudge
      const baseBlend = (0.7 * overall_score) + (0.3 * (starNorm ?? overall_score));
      blended_overall = Math.max(-1, Math.min(1, Math.round((baseBlend + wtaNudge) * 100) / 100));
      blended_label =
        blended_overall > THRESH ? 'positive' : blended_overall < -THRESH ? 'negative' : 'neutral';
    }

    // Cache for 10 minutes (works on Vercel); safe to keep locally.
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=600');

    res.status(200).json({
      message: 'success',
      data: {
        professor: `${json.data.firstName} ${json.data.lastName}`,
        totalComments: items.length,
        numRatings: json.data.numRatings,
        overall_score,
        overall_label,
        ...(blended_overall !== undefined ? { blended_overall, blended_label } : {}),
        counts,
        results: weighted,
        meta: {
          limit: cap,
          ...(months ? { sinceMonths: months } : {}),
          avgRating: json.data.avgRating,
          wouldTakeAgainPercent: json.data.wouldTakeAgainPercent,
        },
      },
    });
  } catch (e: any) {
    res.status(500).json({ message: 'error', error: e?.message ?? 'Internal error' });
  }
}
