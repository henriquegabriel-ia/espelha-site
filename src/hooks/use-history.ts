import { useState, useCallback } from 'react';

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  jsonRender: object;
  designSystem?: object;
  analysis?: object;
}

const STORAGE_KEY = 'clonador-history';
const MAX_ENTRIES = 10;

function readStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage pode falhar em private browsing
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => readStorage());

  const getHistory = useCallback((): HistoryEntry[] => {
    return readStorage();
  }, []);

  const addToHistory = useCallback((entry: HistoryEntry): void => {
    setHistory((prev) => {
      // Remove duplicata pela mesma URL (se existir)
      const filtered = prev.filter((e) => e.url !== entry.url);
      const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((id: string): void => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback((): void => {
    writeStorage([]);
    setHistory([]);
  }, []);

  return { history, getHistory, addToHistory, removeFromHistory, clearHistory };
}
