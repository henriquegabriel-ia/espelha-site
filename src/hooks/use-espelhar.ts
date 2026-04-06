import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ScrapedPage, JsonRenderOutput, AnalysisReport } from '@/types/espelhar';
import { useProvider } from './use-provider';

export type EspelharStep = 'idle' | 'scraping' | 'converting' | 'analyzing' | 'optimizing' | 'complete' | 'error';

interface EspelharState {
  step: EspelharStep;
  scrapedData: ScrapedPage | null;
  jsonRender: JsonRenderOutput | null;
  analysis: AnalysisReport | null;
  optimizedJson: JsonRenderOutput | null;
  error: string | null;
  /** Tracks which step was active before an error occurred */
  errorStep: EspelharStep | null;
}

const initialState: EspelharState = {
  step: 'idle',
  scrapedData: null,
  jsonRender: null,
  analysis: null,
  optimizedJson: null,
  error: null,
  errorStep: null,
};

export function useEspelhar() {
  const [state, setState] = useState<EspelharState>(initialState);
  const { provider, apiKey } = useProvider();

  const getHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey && provider) {
      headers['x-api-key'] = apiKey;
      headers['x-provider'] = provider;
    }
    return headers;
  }, [apiKey, provider]);

  const espelhar = useCallback(async (url: string) => {
    const headers = getHeaders();

    // Reset state and start scraping
    setState({
      ...initialState,
      step: 'scraping',
    });

    try {
      // 1. Scrape
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape', {
        body: { url },
        headers,
      });
      if (scrapeError) throw new Error(scrapeError.message || 'Erro ao fazer scraping do site');
      const scrapedPage = scrapeData as ScrapedPage;

      setState((prev) => ({
        ...prev,
        step: 'converting',
        scrapedData: scrapedPage,
      }));

      // 2. Convert
      const { data: convertData, error: convertError } = await supabase.functions.invoke('convert', {
        body: { scrapedData: scrapedPage },
        headers,
      });
      if (convertError) throw new Error(convertError.message || 'Erro ao converter para JSON Render');
      const jsonRender = convertData as JsonRenderOutput;

      setState((prev) => ({
        ...prev,
        step: 'analyzing',
        jsonRender,
      }));

      // 3. Analyze
      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke('analyze', {
        body: { jsonRender },
        headers,
      });
      if (analyzeError) throw new Error(analyzeError.message || 'Erro ao analisar o site');
      const analysis = analyzeData as AnalysisReport;

      setState((prev) => ({
        ...prev,
        step: 'complete',
        analysis,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        step: 'error',
        errorStep: prev.step,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    }
  }, [getHeaders]);

  const generateOptimized = useCallback(async () => {
    const headers = getHeaders();

    setState((prev) => ({
      ...prev,
      step: 'optimizing',
      error: null,
      errorStep: null,
    }));

    try {
      const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke('optimize', {
        body: {
          jsonRender: state.jsonRender,
          suggestions: state.analysis?.suggestions,
        },
        headers,
      });
      if (optimizeError) throw new Error(optimizeError.message || 'Erro ao otimizar o JSON');
      const optimizedJson = optimizeData as JsonRenderOutput;

      setState((prev) => ({
        ...prev,
        step: 'complete',
        optimizedJson,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        step: 'error',
        errorStep: 'optimizing',
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    }
  }, [getHeaders, state.jsonRender, state.analysis]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    espelhar,
    generateOptimized,
    reset,
  };
}
