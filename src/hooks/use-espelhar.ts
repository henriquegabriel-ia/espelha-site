import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ScrapedPage, JsonRenderOutput, AnalysisReport, DesignSystem } from '@/types/espelhar';
import { useProvider } from './use-provider';

export type EspelharStep = 'idle' | 'scraping' | 'converting' | 'analyzing' | 'optimizing' | 'complete' | 'error';

interface EspelharState {
  step: EspelharStep;
  scrapedData: ScrapedPage | null;
  jsonRender: JsonRenderOutput | null;
  analysis: AnalysisReport | null;
  optimizedJson: JsonRenderOutput | null;
  designSystem: DesignSystem | null;
  error: string | null;
  errorStep: EspelharStep | null;
}

const initialState: EspelharState = {
  step: 'idle',
  scrapedData: null,
  jsonRender: null,
  analysis: null,
  optimizedJson: null,
  designSystem: null,
  error: null,
  errorStep: null,
};

/**
 * Invoke a Supabase Edge Function (or local dev server) with timeout.
 * Extracts error messages from various response formats.
 */
async function invokeFunction(
  fnName: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  timeoutMs = 90_000
): Promise<unknown> {
  // Race between the actual call and a timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(
      `Tempo limite excedido (${Math.round(timeoutMs / 1000)}s) na etapa "${fnName}". Tente com um site menor.`
    )), timeoutMs);
  });

  const invokePromise = supabase.functions.invoke(fnName, { body, headers });

  const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as Awaited<typeof invokePromise>;

  // 1. SDK-level error
  if (error) {
    const msg = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);
    throw new Error(msg || `Erro na etapa "${fnName}"`);
  }

  // 2. Server returned { error: "..." } in body (dev server pattern)
  if (
    data &&
    typeof data === 'object' &&
    'error' in (data as Record<string, unknown>) &&
    !('root' in (data as Record<string, unknown>)) &&
    !('positives' in (data as Record<string, unknown>)) &&
    !('colors' in (data as Record<string, unknown>))
  ) {
    throw new Error((data as { error: string }).error);
  }

  // 3. Null/empty data
  if (!data) {
    throw new Error(`Resposta vazia da etapa "${fnName}". Verifique as configurações.`);
  }

  return data;
}

export function useEspelhar() {
  const [state, setState] = useState<EspelharState>(initialState);
  const { provider, apiKey } = useProvider();

  const getHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (apiKey && provider) {
      headers['x-api-key'] = apiKey;
      headers['x-provider'] = provider;
    }
    return headers;
  }, [apiKey, provider]);

  const espelhar = useCallback(async (url: string) => {
    const headers = getHeaders();

    setState({ ...initialState, step: 'scraping' });

    try {
      // 1. Scrape (timeout 120s — sites grandes como portais podem demorar)
      console.log('[espelhar] Iniciando scrape:', url);
      const scrapedPage = await invokeFunction('scrape', { url }, headers, 120_000) as ScrapedPage;
      console.log('[espelhar] Scrape concluído:', scrapedPage.title);

      setState((prev) => ({ ...prev, step: 'converting', scrapedData: scrapedPage }));

      // 2. Convert + Extract Design System (em paralelo, timeout 90s cada)
      console.log('[espelhar] Iniciando convert + design system em paralelo');
      const [jsonRender, designSystem] = await Promise.all([
        invokeFunction('convert', { scrapedData: scrapedPage }, headers, 90_000) as Promise<JsonRenderOutput>,
        invokeFunction('extract-design-system', { scrapedData: scrapedPage }, headers, 90_000)
          .then((ds) => ds as DesignSystem)
          .catch((err) => {
            console.warn('[espelhar] Design system extraction failed (non-blocking):', err.message);
            return null;
          }),
      ]);
      console.log('[espelhar] Convert concluído');

      setState((prev) => ({ ...prev, step: 'analyzing', jsonRender, designSystem }));

      // 3. Analyze (timeout 120s) — non-blocking, se falhar mostra resultados parciais
      console.log('[espelhar] Iniciando análise');
      let analysis: AnalysisReport | null = null;
      try {
        analysis = await invokeFunction('analyze', { jsonRender, originalUrl: url }, headers, 120_000) as AnalysisReport;
        console.log('[espelhar] Análise concluída');
      } catch (analyzeErr) {
        console.warn('[espelhar] Análise falhou (non-blocking):', analyzeErr instanceof Error ? analyzeErr.message : analyzeErr);
      }

      setState((prev) => ({ ...prev, step: 'complete', analysis }));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[espelhar] Erro:', message);
      setState((prev) => ({
        ...prev,
        step: 'error',
        errorStep: prev.step,
        error: message,
      }));
    }
  }, [getHeaders]);

  const generateOptimized = useCallback(async () => {
    const headers = getHeaders();

    setState((prev) => ({ ...prev, step: 'optimizing', error: null, errorStep: null }));

    try {
      const optimizedJson = await invokeFunction(
        'optimize',
        { jsonRender: state.jsonRender, suggestions: state.analysis?.suggestions },
        headers,
        90_000
      ) as JsonRenderOutput;

      setState((prev) => ({ ...prev, step: 'complete', optimizedJson }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setState((prev) => ({
        ...prev,
        step: 'error',
        errorStep: 'optimizing',
        error: message,
      }));
    }
  }, [getHeaders, state.jsonRender, state.analysis]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { ...state, espelhar, generateOptimized, reset };
}
