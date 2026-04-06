import { type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JsonRenderElement {
  type: string;
  props: Record<string, unknown>;
  children?: string[];
}

interface JsonRenderData {
  root: string;
  elements: Record<string, JsonRenderElement>;
}

interface JsonRenderPreviewProps {
  data: JsonRenderData | null;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Recursive renderer
// ---------------------------------------------------------------------------

function renderElement(
  id: string,
  elements: Record<string, JsonRenderElement>,
): ReactNode {
  const element = elements[id];
  if (!element) return null;

  const { type, props, children } = element;

  // Render children recursively
  const renderedChildren = children?.map((childId) =>
    renderElement(childId, elements),
  );

  switch (type) {
    case "Section": {
      const title = props.title as string | undefined;
      const sectionId = props.id as string | undefined;
      return (
        <section key={id} id={sectionId} className="space-y-3">
          {title && (
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          )}
          {renderedChildren}
        </section>
      );
    }

    case "Heading": {
      const level = (props.level as number) ?? 2;
      const text = props.text as string;
      const sizeMap: Record<number, string> = {
        1: "text-4xl font-bold",
        2: "text-3xl font-semibold",
        3: "text-2xl font-semibold",
        4: "text-xl font-medium",
        5: "text-lg font-medium",
        6: "text-base font-medium",
      };
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag key={id} className={`${sizeMap[level] ?? sizeMap[2]} text-foreground`}>
          {text}
        </Tag>
      );
    }

    case "Paragraph": {
      const text = props.text as string;
      return (
        <p key={id} className="text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
      );
    }

    case "Image": {
      const src = props.src as string;
      const alt = props.alt as string;
      const width = props.width as number | undefined;
      const height = props.height as number | undefined;
      return (
        <img
          key={id}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="max-w-full rounded-md object-cover"
        />
      );
    }

    case "Link": {
      const href = props.href as string;
      const text = props.text as string;
      const external = props.external as boolean | undefined;
      return (
        <a
          key={id}
          href={href}
          className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {text}
        </a>
      );
    }

    case "Card": {
      const title = props.title as string;
      const description = props.description as string;
      const image = props.image as string | undefined;
      return (
        <Card key={id}>
          {image && (
            <img
              src={image}
              alt={title}
              className="w-full rounded-t-lg object-cover"
            />
          )}
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {renderedChildren && renderedChildren.length > 0 && (
            <CardContent>{renderedChildren}</CardContent>
          )}
        </Card>
      );
    }

    case "List": {
      const items = props.items as string[];
      const ordered = props.ordered as boolean;
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag
          key={id}
          className={`space-y-1 pl-5 text-sm text-muted-foreground ${
            ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }

    case "Table": {
      const headers = props.headers as string[];
      const rows = props.rows as string[][];
      return (
        <div key={id} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headers?.map((header, i) => (
                  <th
                    key={i}
                    className="border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-left font-medium text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows?.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-zinc-700 px-3 py-2 text-muted-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "Badge": {
      const text = props.text as string;
      const variant = props.variant as
        | "default"
        | "secondary"
        | "outline"
        | "destructive"
        | undefined;
      return (
        <Badge key={id} variant={variant}>
          {text}
        </Badge>
      );
    }

    case "Button": {
      const text = props.text as string;
      const href = props.href as string | undefined;
      const variant = props.variant as
        | "default"
        | "secondary"
        | "outline"
        | "ghost"
        | undefined;
      if (href) {
        return (
          <a key={id} href={href} target="_blank" rel="noopener noreferrer">
            <Button variant={variant}>{text}</Button>
          </a>
        );
      }
      return (
        <Button key={id} variant={variant}>
          {text}
        </Button>
      );
    }

    case "Hero": {
      const title = props.title as string;
      const subtitle = props.subtitle as string | undefined;
      const cta = props.cta as string | undefined;
      const ctaHref = props.ctaHref as string | undefined;
      return (
        <section
          key={id}
          className="flex flex-col items-center gap-4 rounded-lg bg-zinc-800/30 px-6 py-12 text-center"
        >
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="max-w-xl text-muted-foreground">{subtitle}</p>
          )}
          {cta && (
            <a
              href={ctaHref ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">{cta}</Button>
            </a>
          )}
          {renderedChildren}
        </section>
      );
    }

    case "Nav": {
      const items = props.items as Array<{ text: string; href: string }>;
      return (
        <nav
          key={id}
          className="flex flex-wrap items-center gap-4 border-b border-zinc-700 pb-3"
        >
          {items?.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.text}
            </a>
          ))}
        </nav>
      );
    }

    case "Footer": {
      const text = props.text as string;
      const links = props.links as
        | Array<{ text: string; href: string }>
        | undefined;
      return (
        <footer
          key={id}
          className="flex flex-col items-center gap-2 border-t border-zinc-700 pt-4 text-xs text-muted-foreground"
        >
          <p>{text}</p>
          {links && links.length > 0 && (
            <div className="flex gap-3">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {link.text}
                </a>
              ))}
            </div>
          )}
        </footer>
      );
    }

    default:
      return (
        <div
          key={id}
          className="rounded border border-dashed border-yellow-600/50 bg-yellow-900/10 px-3 py-2 text-xs text-yellow-500"
        >
          [Unknown: {type}]
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function PreviewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function JsonRenderPreview({ data, isLoading }: JsonRenderPreviewProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50">
      {/* Header label */}
      <div className="border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Preview
        </span>
      </div>

      {/* Content area */}
      <div className="max-h-[600px] overflow-y-auto p-4">
        {isLoading ? (
          <PreviewSkeleton />
        ) : data ? (
          <div className="space-y-4">
            {renderElement(data.root, data.elements)}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum preview disponivel
          </p>
        )}
      </div>
    </div>
  );
}
