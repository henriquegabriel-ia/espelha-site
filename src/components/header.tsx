import { Link, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--glass-border)] bg-background/85 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-lg font-heading">
          <Link className="h-5 w-5 text-primary" />
          <span className="text-primary">Clonador de Sites</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
