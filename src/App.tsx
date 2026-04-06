import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-xs">
            v0.1.0 — Setup completo
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Espelha Site
          </h1>
          <p className="text-xl text-muted-foreground">
            Espelhe, analise e otimize qualquer site com IA
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stack configurada</CardTitle>
            <CardDescription>
              React + Vite + TypeScript + Tailwind + shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 justify-center">
            <Badge>React 18</Badge>
            <Badge>Vite 6</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS 3</Badge>
            <Badge>shadcn/ui</Badge>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button size="lg">Comecar</Button>
          <Button variant="outline" size="lg">
            Documentacao
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
