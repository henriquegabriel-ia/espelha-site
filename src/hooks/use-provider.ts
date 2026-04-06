import { useState, useCallback, useMemo } from "react";

export type Provider = "openai" | "anthropic" | "gemini";
export type ProviderStatus = "byo" | "lovable-ai" | "none";

const STORAGE_KEY_PROVIDER = "espelha-provider";
const STORAGE_KEY_API_KEY = "espelha-api-key";

function readFromStorage(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeToStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (SSR, private mode, etc.)
  }
}

function removeFromStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage unavailable
  }
}

export function useProvider() {
  const [provider, setProviderState] = useState<Provider>(
    () => (readFromStorage(STORAGE_KEY_PROVIDER) as Provider) || "openai"
  );
  const [apiKey, setApiKeyState] = useState<string>(
    () => readFromStorage(STORAGE_KEY_API_KEY)
  );

  const setProvider = useCallback((value: Provider) => {
    setProviderState(value);
    writeToStorage(STORAGE_KEY_PROVIDER, value);
  }, []);

  const setApiKey = useCallback((value: string) => {
    setApiKeyState(value);
    writeToStorage(STORAGE_KEY_API_KEY, value);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    removeFromStorage(STORAGE_KEY_API_KEY);
  }, []);

  const providerStatus: ProviderStatus = useMemo(() => {
    if (apiKey) return "byo";
    try {
      if (window.location.hostname.includes("lovable")) return "lovable-ai";
    } catch {
      // window not available
    }
    return "none";
  }, [apiKey]);

  return {
    provider,
    apiKey,
    setProvider,
    setApiKey,
    clearApiKey,
    providerStatus,
  };
}
