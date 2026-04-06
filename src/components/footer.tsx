import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/henriquegabriel-ia/espelha-site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
        <p>Feito com IA</p>
      </div>
    </footer>
  );
}
