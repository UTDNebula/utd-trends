// src/modules/sentiment.ts
export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
  sentiment: SentimentLabel;
  score: number;        // -1..1
  confidence: number;   // 0..1
  breakdown: {
    positive_words: string[];
    negative_words: string[];
    total_words: number;
  };
}

const POSITIVE_WORDS = [
  'amazing','awesome','excellent','fantastic','great','good','wonderful',
  'outstanding','brilliant','superb','helpful','clear','easy','love',
  'best','perfect','incredible','recommended','enjoy','favorite',
  'passionate','engaging','inspiring','thorough','organized','fair',
  'understanding','patient','knowledgeable','respectful','caring',
  'approachable','effective','interesting','fun','cool','nice'
];

const NEGATIVE_WORDS = [
  'awful','terrible','horrible','bad','worst','hate','boring',
  'confusing','unclear','difficult','hard','impossible','unfair',
  'rude','disrespectful','unhelpful','unprepared','disorganized',
  'harsh','strict','mean','arrogant','condescending','frustrating',
  'disappointing','waste','avoid','regret','struggled','failed',
  'biased','unprofessional','lazy','careless','useless'
];

const INTENSIFIERS: Record<string, number> = {
  very: 1.5, extremely: 2.0, incredibly: 1.8, really: 1.3, so: 1.2,
  absolutely: 1.7, totally: 1.4, completely: 1.6, quite: 1.1, rather: 1.1
};

const NEGATION_WORDS = [
  'not','no','never','nothing','nowhere','nobody','none',
  "don't","doesn't","didn't","won't","wouldn't","can't","couldn't","shouldn't"
];

function preprocessText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function analyzeSingleComment(comment: string): SentimentResult {
  if (!comment?.trim()) {
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      breakdown: { positive_words: [], negative_words: [], total_words: 0 }
    };
  }

  const words = preprocessText(comment);
  const positiveMatches: string[] = [];
  const negativeMatches: string[] = [];
  let score = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const prev2Word = i > 1 ? words[i - 2] : '';

    const isNegated =
      NEGATION_WORDS.includes(prevWord) || NEGATION_WORDS.includes(prev2Word);
    const intensifier = INTENSIFIERS[prevWord] || 1;

    if (POSITIVE_WORDS.includes(word)) {
      positiveMatches.push(word);
      const wordScore = 1 * intensifier;
      score += isNegated ? -wordScore : wordScore;
    } else if (NEGATIVE_WORDS.includes(word)) {
      negativeMatches.push(word);
      const wordScore = 1 * intensifier;
      score += isNegated ? wordScore : -wordScore;
    }
  }

  const normalizedScore = Math.max(-1, Math.min(1, score / Math.sqrt(words.length)));
  const totalSentimentWords = positiveMatches.length + negativeMatches.length;
  const confidence = Math.min(1, totalSentimentWords / Math.max(5, words.length * 0.3));

  let sentiment: SentimentLabel = 'neutral';
  if (normalizedScore > 0.1) sentiment = 'positive';
  else if (normalizedScore < -0.1) sentiment = 'negative';

  return {
    sentiment,
    score: Math.round(normalizedScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    breakdown: {
      positive_words: [...new Set(positiveMatches)],
      negative_words: [...new Set(negativeMatches)],
      total_words: words.length
    }
  };
}

export function analyzeMany(comments: string[]) {
  const results = comments.map(analyzeSingleComment);
  const avg = results.reduce((a, r) => a + r.score, 0) / Math.max(1, results.length);
  const pos = results.filter(r => r.sentiment === 'positive').length;
  const neg = results.filter(r => r.sentiment === 'negative').length;
  const neu = results.length - pos - neg;

  return {
    overall_score: Math.round(avg * 100) / 100,
    overall_label: avg > 0.1 ? 'positive' : avg < -0.1 ? 'negative' : 'neutral',
    counts: { positive: pos, negative: neg, neutral: neu, total: results.length },
    results
  };
}
