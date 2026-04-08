import { useState, useEffect, useCallback, useRef } from "react";
import { Link, Search, Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UrlInput } from "@/components/url-input";
import { ProviderSelect } from "@/components/provider-select";
import { ApiKeyInput } from "@/components/api-key-input";
import { AiProviderBanner } from "@/components/ai-provider-banner";
import { JsonViewer } from "@/components/json-viewer";
import { JsonRenderPreview } from "@/components/json-render-preview";
import { AnalysisReportView } from "@/components/analysis-report";
import { ResultActions } from "@/components/result-actions";
import { ProgressStepper } from "@/components/progress-stepper";
import { DesignSystemView } from "@/components/design-system-view";
import { CssViewer } from "@/components/css-viewer";
import { LovablePromptButton } from "@/components/lovable-prompt-button";
import { HtmlViewer } from "@/components/html-viewer";
import { useEspelhar } from "@/hooks/use-espelhar";
import { generateCSS } from "@/lib/generate-css";
import { useProvider } from "@/hooks/use-provider";
import { useHistory } from "@/hooks/use-history";
import { HistoryPanel } from "@/components/history-panel";
import type { HistoryEntry } from "@/hooks/use-history";

function App() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const {
    provider,
    apiKey,
    setProvider,
    setApiKey,
    clearApiKey,
    providerStatus,
  } = useProvider();

  const {
    step,
    lastUrl,
    scrapedData,
    jsonRender,
    analysis,
    optimizedJson,
    designSystem,
    error,
    espelhar,
    reset,
    loadFromHistory,
  } = useEspelhar();

  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();

  // Save to history when espelhamento completes
  const savedUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (step === 'complete' && jsonRender && lastUrl && lastUrl !== savedUrlRef.current) {
      savedUrlRef.current = lastUrl;
      addToHistory({
        id: Date.now().toString(),
        url: lastUrl,
        title: jsonRender.metadata?.title || '',
        timestamp: new Date().toISOString(),
        jsonRender: jsonRender as object,
        designSystem: designSystem ? (designSystem as object) : undefined,
        analysis: analysis ? (analysis as object) : undefined,
      });
    }
    if (step === 'idle') {
      savedUrlRef.current = null;
    }
  }, [step, jsonRender, lastUrl, designSystem, analysis, addToHistory]);

  function handleHistorySelect(entry: HistoryEntry) {
    loadFromHistory({
      url: entry.url,
      jsonRender: entry.jsonRender,
      analysis: entry.analysis,
      designSystem: entry.designSystem,
    });
  }

  const isLoading = step === "scraping" || step === "converting" || step === "analyzing";
  const isOptimizing = step === "optimizing";
  const hasStarted = step !== "idle";
  const hasResults = jsonRender !== null;
  const hasAnalysis = analysis !== null;
  const hasOptimized = optimizedJson !== null;
  const hasDesignSystem = designSystem !== null;

  function handleSubmit(url: string) {
    espelhar(url);
  }

  function handleRetry() {
    reset();
  }

  const features = [
    {
      icon: Link,
      title: "Espelha",
      description: "Converte qualquer URL em JSON estruturado",
    },
    {
      icon: Search,
      title: "Analisa",
      description: "IA avalia design, SEO, conteúdo e estrutura",
    },
    {
      icon: Sparkles,
      title: "Otimiza",
      description: "Gera versão melhorada com sugestões aplicadas",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 relative">
          <div className="absolute inset-0 gradient-hero pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gradient font-heading leading-[0.92]">
                Espelha Site
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Espelhe qualquer site. Analise. Otimize. Copie.
              </p>
            </div>

            {/* URL Input */}
            <div className="max-w-xl mx-auto">
              <UrlInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={isOptimizing}
              />
            </div>

            {/* Provider + API Key Row */}
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <ProviderSelect
                  provider={provider}
                  onProviderChange={setProvider}
                />
                <div className="flex-1">
                  <ApiKeyInput
                    apiKey={apiKey}
                    onSave={setApiKey}
                    onClear={clearApiKey}
                  />
                </div>
              </div>

              {/* Provider Banner */}
              <AiProviderBanner
                provider={provider}
                providerStatus={providerStatus}
              />

              {/* How it works */}
              <div className="text-left max-w-lg mx-auto mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground/80">Como funciona:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Cole a URL de qualquer site e clique em <strong className="text-foreground">Espelhar</strong></li>
                  <li>A IA converte a estrutura do site em JSON (<span className="font-mono text-xs">json-render</span>)</li>
                  <li>Receba uma análise completa: design, SEO, conteúdo e estrutura</li>
                  <li>Baixe o JSON original ou gere uma versão otimizada com as sugestões da IA</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Stepper */}
        {hasStarted && (
          <section className="pb-6">
            <div className="max-w-4xl mx-auto px-4">
              <ProgressStepper currentStep={step} />
            </div>
          </section>
        )}

        {/* Error Alert */}
        {step === "error" && error && (
          <section className="pb-6">
            <div className="max-w-4xl mx-auto px-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between gap-4">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="shrink-0"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}

        {/* Results Section */}
        {(hasResults || isLoading) && (
          <section className="pb-8 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                JSON Render
              </h2>

              <Tabs defaultValue="json" className="w-full">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="json" className="flex-1 sm:flex-initial">JSON</TabsTrigger>
                  <TabsTrigger value="tree" className="flex-1 sm:flex-initial">Tree</TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1 sm:flex-initial">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="json">
                  <JsonViewer
                    data={jsonRender as unknown as Record<string, unknown> | null}
                    isLoading={step === "scraping" || step === "converting"}
                    mode="json"
                  />
                </TabsContent>
                <TabsContent value="tree">
                  <JsonViewer
                    data={jsonRender as unknown as Record<string, unknown> | null}
                    isLoading={step === "scraping" || step === "converting"}
                    mode="tree"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <JsonRenderPreview
                    data={jsonRender}
                    isLoading={step === "scraping" || step === "converting"}
                  />
                </TabsContent>
              </Tabs>

              {/* Result Actions */}
              {hasResults && (
                <>
                  <ResultActions
                    originalJson={jsonRender as unknown as Record<string, unknown>}
                    optimizedJson={hasOptimized ? (optimizedJson as unknown as Record<string, unknown>) : undefined}
                  />
                  <LovablePromptButton
                    jsonRender={jsonRender}
                    designSystem={designSystem}
                    originalUrl={lastUrl ?? ""}
                    html={scrapedData?.html}
                  />
                </>
              )}
            </div>
          </section>
        )}

        {/* HTML do Site */}
        {hasResults && scrapedData?.html && (
          <section className="pb-8 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-heading">HTML</h2>
              <HtmlViewer html={scrapedData.html} />
            </div>
          </section>
        )}

        {/* CSS Gerado */}
        {hasDesignSystem && (
          <section className="pb-8 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-heading">CSS</h2>
              <CssViewer css={generateCSS(designSystem!)} />
            </div>
          </section>
        )}

        {/* Design System Section */}
        {hasDesignSystem && (
          <section className="pb-8 animate-slide-up">
            <div className="max-w-4xl mx-auto px-4">
              <DesignSystemView designSystem={designSystem} />
            </div>
          </section>
        )}

        {/* Analysis Section */}
        {(hasAnalysis || step === "analyzing") && (
          <section className="pb-8 animate-slide-up">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
              <AnalysisReportView
                report={analysis}
                isLoading={step === "analyzing"}
                onGenerateOptimized={undefined}
                isOptimizing={false}
              />
              {hasAnalysis && jsonRender && (
                <LovablePromptButton
                  jsonRender={jsonRender}
                  designSystem={designSystem}
                  originalUrl={lastUrl ?? ""}
                  html={scrapedData?.html}
                  improvements={analysis?.suggestions?.map((s) => ({
                    category: s.category,
                    description: s.description,
                    impact: s.impact,
                  }))}
                  label="Gerar prompt com as melhorias"
                />
              )}
            </div>
          </section>
        )}

        {/* Optimized Section */}
        {hasOptimized && (
          <section className="pb-8 animate-slide-up">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  JSON Otimizado
                </h2>
              </div>

              <Tabs defaultValue="json" className="w-full">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="json" className="flex-1 sm:flex-initial">JSON</TabsTrigger>
                  <TabsTrigger value="tree" className="flex-1 sm:flex-initial">Tree</TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1 sm:flex-initial">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="json">
                  <JsonViewer
                    data={optimizedJson as unknown as Record<string, unknown>}
                    mode="json"
                  />
                </TabsContent>
                <TabsContent value="tree">
                  <JsonViewer
                    data={optimizedJson as unknown as Record<string, unknown>}
                    mode="tree"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <JsonRenderPreview data={optimizedJson} />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        )}

        {/* Features Section - only visible when idle */}
        {!hasStarted && (
          <section className="pb-8">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <Card
                    key={feature.title}
                    className="glass transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <CardHeader className="space-y-1">
                      <feature.icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* History Section - only visible when idle */}
        {!hasStarted && history.length > 0 && (
          <section className="pb-20">
            <div className="max-w-2xl mx-auto px-4">
              <HistoryPanel
                history={history}
                onSelect={handleHistorySelect}
                onRemove={removeFromHistory}
                onClear={clearHistory}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
