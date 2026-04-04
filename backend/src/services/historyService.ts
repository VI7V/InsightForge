import { CSVHistory } from '../types';
import { storeJSON, getJSON, listKeys } from '../utils/storage';

export async function saveHistory(history: CSVHistory): Promise<void> {
  await storeJSON(`history:${history.userId}:${history.id}`, history, 60 * 60 * 24 * 90); // 90 days
  // Also store id in user's index
  const index = await getJSON<string[]>(`history-index:${history.userId}`) || [];
  if (!index.includes(history.id)) {
    index.unshift(history.id); // newest first
    await storeJSON(`history-index:${history.userId}`, index.slice(0, 50)); // keep last 50
  }
}

export async function getUserHistory(userId: string): Promise<CSVHistory[]> {
  const index = await getJSON<string[]>(`history-index:${userId}`) || [];
  const results: CSVHistory[] = [];
  for (const id of index) {
    const item = await getJSON<CSVHistory>(`history:${userId}:${id}`);
    if (item) results.push(item);
  }
  return results;
}

export async function deleteHistory(userId: string, historyId: string): Promise<void> {
  const { deleteKey } = await import('../utils/storage');
  await deleteKey(`history:${userId}:${historyId}`);
  const index = await getJSON<string[]>(`history-index:${userId}`) || [];
  const newIndex = index.filter(id => id !== historyId);
  await storeJSON(`history-index:${userId}`, newIndex);
}
