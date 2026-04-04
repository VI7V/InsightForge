import { SalesRecord, SentimentResult } from '../types';

const POS = new Set(['excellent','amazing','fantastic','great','wonderful','superb','outstanding','love','best','perfect','happy','satisfied','top','highly','recommend','fast','quick','quality','value','good','nice','awesome','brilliant','exceeded','expectations','pleased','delighted','impressed','five','stars']);
const NEG = new Set(['poor','bad','terrible','horrible','awful','disappointing','disappointed','broken','damaged','missing','wrong','issues','problem','slow','late','mediocre','average','returned','failed','stopped','working','unclear','confusing','not','worst','hate','refund','waste','overpriced']);

function scoreFeedback(text: string): 'positive' | 'negative' | 'neutral' {
  const words = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    const c = w.replace(/[^a-z]/g, '');
    if (POS.has(c)) pos++;
    if (NEG.has(c)) neg++;
  }
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
}

export function analyzeSentiment(records: SalesRecord[]): SentimentResult {
  const feedbacks = records.map(r => r.feedback_text).filter(f => f?.trim());
  if (!feedbacks.length) return { positive: 0, negative: 0, neutral: 100, overallScore: 50 };
  let pos = 0, neg = 0, neu = 0;
  for (const f of feedbacks) {
    const r = scoreFeedback(f);
    if (r === 'positive') pos++;
    else if (r === 'negative') neg++;
    else neu++;
  }
  const t = feedbacks.length;
  return {
    positive: parseFloat(((pos / t) * 100).toFixed(1)),
    negative: parseFloat(((neg / t) * 100).toFixed(1)),
    neutral: parseFloat(((neu / t) * 100).toFixed(1)),
    overallScore: parseFloat(Math.max(0, Math.min(100, ((pos - neg * 0.5) / t) * 100 + 50)).toFixed(1)),
  };
}

export function extractKeyThemes(records: SalesRecord[]): string[] {
  const stop = new Set(['the','and','but','was','is','it','for','to','a','an','of','my','with','after','very','this','that','they']);
  const wc = new Map<string, number>();
  for (const r of records) {
    for (const w of r.feedback_text.toLowerCase().split(/\s+/)) {
      const c = w.replace(/[^a-z]/g, '');
      if (c.length > 3 && !stop.has(c)) wc.set(c, (wc.get(c) || 0) + 1);
    }
  }
  return [...wc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w]) => w);
}
