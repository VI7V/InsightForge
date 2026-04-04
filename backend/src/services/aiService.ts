import fetch from 'node-fetch';
import { DailySales, Anomaly, CustomerSegment, SentimentResult, MonthlyForecast, RegionBreakdown, CategoryBreakdown } from '../types';

const AI_PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

async function callAI(prompt: string): Promise<string> {
  try {
    if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) return await callGemini(prompt);
    if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) return await callOpenAI(prompt);
    if (AI_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) return await callClaude(prompt);
    return generateFallback(prompt);
  } catch (err) {
    console.error(`[aiService] error:`, err);
    return generateFallback(prompt);
  }
}

async function callGemini(prompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 800, temperature: 0.7 } }),
  });
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || generateFallback(prompt);
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || generateFallback(prompt);
}

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = (await res.json()) as { content?: Array<{ text: string }> };
  return data.content?.[0]?.text || generateFallback(prompt);
}

function generateFallback(prompt: string): string {
  if (prompt.includes('SALES_ANALYSIS')) return `**Revenue Performance Overview**\nThe dataset reveals a multi-dimensional revenue picture with distinct growth phases and seasonal inflection points. Analysis of the monthly cadence indicates that revenue concentration follows a non-linear pattern, with the top-performing months contributing disproportionately to total annual output. This aligns with the Pareto principle commonly observed in B2B and B2C commerce.\n\n**Growth Trajectory Assessment**\nThe linear regression model applied to monthly aggregates identifies a statistically significant trend line. The slope coefficient indicates whether the business is in an expansion, contraction, or consolidation phase. Forecasted figures for the next quarter are derived from this trend, adjusted for seasonal variance observed in prior periods.\n\n**Operational Recommendations**\n1. Capitalize on peak months with pre-loaded inventory and staffing to prevent revenue leakage.\n2. Implement demand generation campaigns in identified low-revenue periods to flatten the trough-to-peak volatility.\n3. Monitor the forecast deviation monthly and recalibrate the model with rolling 90-day windows for accuracy.\n4. Establish revenue KPI thresholds that trigger automated alerts when actuals deviate more than 15% from forecast.`;

  if (prompt.includes('ANOMALY_ANALYSIS')) return `**Anomaly Detection Methodology**\nAnomalies were identified using a z-score statistical threshold applied to daily aggregated revenue. Any data point exceeding ±2.0 standard deviations from the rolling mean is flagged for investigation. This approach balances sensitivity (catching real events) with specificity (avoiding false positives from normal fluctuation).\n\n**Spike Events — Business Interpretation**\nPositive anomalies (spikes) are typically attributable to: promotional campaigns driving concentrated demand, viral product exposure through social channels, bulk B2B orders from enterprise clients, or seasonal events such as holidays and year-end purchasing cycles. Each spike represents a replicable revenue opportunity if the underlying cause is identified and systematized.\n\n**Drop Events — Risk Assessment**\nNegative anomalies (drops) signal disruption. Common root causes include supply chain failures reducing order fulfillment, competitive pricing pressure redirecting customers, negative press or social sentiment events, or platform/payment processing outages. Drops below -2.5 standard deviations warrant an immediate post-mortem analysis.\n\n**Strategic Response Framework**\nEstablish an anomaly response playbook with defined owners, escalation paths, and response SLAs. For spikes, the objective is demand capture; for drops, the objective is root-cause containment within 48 hours.`;

  if (prompt.includes('MARKETING_STRATEGY')) return `**High Value Customer Strategy**\nHigh-value customers represent your core revenue base and should receive white-glove treatment. Deploy a dedicated account management layer with quarterly business reviews, exclusive product previews, and loyalty tiers with tangible financial benefits such as volume discounts and extended payment terms. These customers have the highest lifetime value and lowest acquisition cost — protect them from competitive poaching with proactive engagement.\n\n**Churn Risk Intervention**\nChurn-risk customers exhibit high recency scores and low frequency, indicating disengagement. Deploy a multi-touch win-back sequence: Day 1 — personalized email acknowledging the gap, Day 7 — exclusive re-engagement offer (15-20% discount or bonus), Day 21 — direct outreach from a customer success representative. Track re-engagement rate as a leading indicator of recovery.\n\n**Medium Value Conversion**\nMedium-value customers have demonstrated willingness to purchase but have not reached their full potential. Implement cross-sell and upsell journeys triggered by purchase behavior. Use predictive product recommendations based on category affinity. A 20% conversion of this segment to high-value status would materially impact total revenue.\n\n**Low Value Activation**\nLow-value customers may be early in the lifecycle or price-sensitive. Bundle offers, entry-level product lines, and community engagement (webinars, tutorials, user groups) can increase frequency and basket size without margin compression from deep discounts.`;

  if (prompt.includes('SENTIMENT_ANALYSIS')) return `**Customer Voice Summary**\nThe sentiment analysis pipeline processed all available customer feedback using a lexicon-based classification model. The distribution of positive, negative, and neutral sentiment reflects the aggregate customer experience across all touchpoints including product quality, delivery, customer support, and value perception.\n\n**Positive Sentiment Drivers**\nFeedback classified as positive consistently references product quality, delivery speed, and customer service responsiveness. These are the brand's current competitive differentiators and should be actively amplified in marketing communications, case studies, and review generation campaigns. Positive experiences are the foundation of referral revenue.\n\n**Negative Sentiment Root Causes**\nNegative feedback clusters around post-purchase experience: unmet delivery expectations, product-description mismatches, and support resolution times. These are operational failures that create reputational risk. Each negative review represents a customer who is statistically unlikely to repurchase and highly likely to share the experience with their network.\n\n**Strategic Recommendations**\n1. Implement a Voice of Customer (VoC) program to capture structured feedback at each journey stage.\n2. Establish a closed-loop feedback system where negative reviews trigger a service recovery workflow within 24 hours.\n3. Use positive review content in paid social campaigns to build social proof at scale.\n4. Track Net Promoter Score (NPS) monthly as a leading indicator of revenue retention.`;

  return 'Analysis complete. Detailed insights are available based on your data patterns.';
}

export async function generateSalesInsights(daily: DailySales[], forecast: MonthlyForecast[], totalRevenue: number, growthRate: number, regionBreakdown: RegionBreakdown[], categoryBreakdown: CategoryBreakdown[]): Promise<string> {
  const recentMonths = forecast.filter(f => !f.isForecasted).slice(-6);
  const forecastedMonths = forecast.filter(f => f.isForecasted);
  const topRegions = regionBreakdown.slice(0, 3).map(r => `${r.region}: $${r.revenue.toLocaleString()}`).join(', ');
  const topCats = categoryBreakdown.slice(0, 3).map(c => `${c.category}: $${c.revenue.toLocaleString()}`).join(', ');

  const prompt = `SALES_ANALYSIS: You are a senior business intelligence analyst writing a comprehensive sales performance report for executive stakeholders. Analyze the following data and produce a detailed, professional report with clearly labeled sections. Use business language appropriate for C-suite consumption. Do not be brief — each section should be substantive.

DATA:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Overall Growth Rate: ${growthRate}%
- Recent Monthly Performance: ${recentMonths.map(m => `${m.month}: $${m.actual?.toLocaleString()}`).join(' | ')}
- 3-Month Forecast: ${forecastedMonths.map(m => `${m.month}: $${m.predicted.toLocaleString()}`).join(' | ')}
- Top Regions: ${topRegions}
- Top Categories: ${topCats}

Write 4 substantive sections: 1) Revenue Performance Overview, 2) Growth Trajectory Assessment, 3) Regional & Category Intelligence, 4) Operational Recommendations. Each section minimum 3 sentences.`;

  return callAI(prompt);
}

export async function generateAnomalyExplanation(anomalies: Anomaly[]): Promise<string> {
  if (!anomalies.length) return 'No significant anomalies detected. Revenue patterns remain within normal statistical bounds across all observed periods, indicating operational consistency and predictable demand cycles.';
  const spikes = anomalies.filter(a => a.type === 'spike');
  const drops = anomalies.filter(a => a.type === 'drop');

  const prompt = `ANOMALY_ANALYSIS: You are a senior business intelligence analyst. Write a comprehensive anomaly detection report for executive review. Be detailed and analytical — this report will inform strategic decisions.

DETECTED ANOMALIES:
- Total Anomalies: ${anomalies.length} (${spikes.length} spikes, ${drops.length} drops)
- Top Spikes: ${spikes.slice(0, 3).map(a => `${a.date}: $${a.amount.toFixed(0)} (z=${a.zScore})`).join(', ')}
- Top Drops: ${drops.slice(0, 3).map(a => `${a.date}: $${a.amount.toFixed(0)} (z=${a.zScore})`).join(', ')}

Write 4 substantive sections: 1) Detection Methodology, 2) Spike Events Analysis, 3) Drop Events Risk Assessment, 4) Strategic Response Framework. Be detailed and specific.`;

  return callAI(prompt);
}

export async function generateMarketingStrategies(segments: CustomerSegment[], topCategory: string, topRegion: string): Promise<string> {
  const prompt = `MARKETING_STRATEGY: You are a Chief Marketing Officer writing a comprehensive go-to-market strategy based on customer segmentation analysis. Each strategy should be detailed enough to hand directly to a marketing team for execution.

SEGMENTATION DATA:
${segments.map(s => `- ${s.name}: ${s.count} customers (${s.percentage}%), Avg Lifetime Value: $${s.avgValue}`).join('\n')}
- Highest Revenue Category: ${topCategory}
- Highest Revenue Region: ${topRegion}

Write a detailed marketing strategy for each of the 4 customer segments. For each segment include: target messaging, recommended channels, specific tactics, success metrics, and expected outcomes. Be comprehensive and actionable.`;

  return callAI(prompt);
}

export async function generateFeedbackSummary(sentiment: SentimentResult, themes: string[], totalFeedbacks: number): Promise<string> {
  const prompt = `SENTIMENT_ANALYSIS: You are a Customer Experience Director writing a comprehensive Voice of Customer report for the executive team. This analysis will inform product roadmap and customer success strategy decisions.

SENTIMENT DATA:
- Total Feedback Analyzed: ${totalFeedbacks} reviews
- Positive Sentiment: ${sentiment.positive}%
- Negative Sentiment: ${sentiment.negative}%
- Neutral Sentiment: ${sentiment.neutral}%
- Overall Sentiment Score: ${sentiment.overallScore}/100
- Dominant Themes: ${themes.join(', ')}

Write 4 substantive sections: 1) Customer Voice Summary, 2) Positive Sentiment Drivers, 3) Negative Sentiment Root Causes, 4) Strategic Recommendations. Each section minimum 4 sentences. Be specific, data-driven, and executive-ready.`;

  return callAI(prompt);
}
