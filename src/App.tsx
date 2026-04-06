import { useState, useEffect, useCallback } from "react";
import { Link, Search, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UrlInput } from "@/components/url-input";

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

  function handleSubmit(url: string) {
    console.log("URL submetida:", url);
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
        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Espelha Site
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Espelhe qualquer site. Analise. Otimize. Copie.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <UrlInput
                onSubmit={handleSubmit}
                isLoading={false}
                disabled={false}
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="transition-colors hover:border-blue-500/50"
                >
                  <CardHeader className="space-y-1">
                    <feature.icon className="h-8 w-8 text-blue-500 mb-2" />
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
      </main>

      <Footer />
    </div>
  );
}

export default App;
