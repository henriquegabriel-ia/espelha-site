import { z } from "zod";

// ---------------------------------------------------------------------------
// Component type constants
// ---------------------------------------------------------------------------

export const COMPONENT_TYPES = [
  "Section",
  "Heading",
  "Paragraph",
  "Image",
  "Link",
  "Card",
  "List",
  "Table",
  "Badge",
  "Button",
  "Hero",
  "Nav",
  "Footer",
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Zod schemas – individual component props
// ---------------------------------------------------------------------------

export const SectionPropsSchema = z.object({
  title: z.string().optional(),
  id: z.string().optional(),
});

export const HeadingPropsSchema = z.object({
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  text: z.string(),
});

export const ParagraphPropsSchema = z.object({
  text: z.string(),
});

export const ImagePropsSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const LinkPropsSchema = z.object({
  href: z.string(),
  text: z.string(),
  external: z.boolean().optional(),
});

export const CardPropsSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
});

export const ListPropsSchema = z.object({
  items: z.array(z.string()),
  ordered: z.boolean(),
});

export const TablePropsSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const BadgePropsSchema = z.object({
  text: z.string(),
  variant: z
    .enum(["default", "secondary", "outline", "destructive"])
    .optional(),
});

export const ButtonPropsSchema = z.object({
  text: z.string(),
  href: z.string().optional(),
  variant: z.enum(["default", "secondary", "outline", "ghost"]).optional(),
});

export const HeroPropsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  cta: z.string().optional(),
  ctaHref: z.string().optional(),
});

export const NavPropsSchema = z.object({
  items: z.array(z.object({ text: z.string(), href: z.string() })),
});

export const FooterPropsSchema = z.object({
  text: z.string(),
  links: z
    .array(z.object({ text: z.string(), href: z.string() }))
    .optional(),
});

// ---------------------------------------------------------------------------
// Props union (discriminated by type)
// ---------------------------------------------------------------------------

export const ComponentPropsSchema = z.union([
  SectionPropsSchema,
  HeadingPropsSchema,
  ParagraphPropsSchema,
  ImagePropsSchema,
  LinkPropsSchema,
  CardPropsSchema,
  ListPropsSchema,
  TablePropsSchema,
  BadgePropsSchema,
  ButtonPropsSchema,
  HeroPropsSchema,
  NavPropsSchema,
  FooterPropsSchema,
]);

// ---------------------------------------------------------------------------
// Element schema – a single node in the document tree
// ---------------------------------------------------------------------------

export const JsonRenderElementSchema = z.object({
  type: z.enum(COMPONENT_TYPES),
  props: z.record(z.string(), z.unknown()),
  children: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Document schema – the top-level json-render structure
// ---------------------------------------------------------------------------

export const JsonRenderDocumentSchema = z.object({
  root: z.string(),
  elements: z.record(z.string(), JsonRenderElementSchema),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

export type SectionProps = z.infer<typeof SectionPropsSchema>;
export type HeadingProps = z.infer<typeof HeadingPropsSchema>;
export type ParagraphProps = z.infer<typeof ParagraphPropsSchema>;
export type ImageProps = z.infer<typeof ImagePropsSchema>;
export type LinkProps = z.infer<typeof LinkPropsSchema>;
export type CardProps = z.infer<typeof CardPropsSchema>;
export type ListProps = z.infer<typeof ListPropsSchema>;
export type TableProps = z.infer<typeof TablePropsSchema>;
export type BadgeProps = z.infer<typeof BadgePropsSchema>;
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type NavProps = z.infer<typeof NavPropsSchema>;
export type FooterProps = z.infer<typeof FooterPropsSchema>;
export type ComponentProps = z.infer<typeof ComponentPropsSchema>;
export type JsonRenderElement = z.infer<typeof JsonRenderElementSchema>;
export type JsonRenderDocument = z.infer<typeof JsonRenderDocumentSchema>;

// ---------------------------------------------------------------------------
// Catalog metadata (used to generate the AI system prompt)
// ---------------------------------------------------------------------------

interface PropDef {
  name: string;
  type: string;
  required: boolean;
}

interface CatalogEntry {
  type: ComponentType;
  description: string;
  props: PropDef[];
}

const CATALOG: CatalogEntry[] = [
  {
    type: "Section",
    description: "Generic container / section wrapper",
    props: [
      { name: "title", type: "string", required: false },
      { name: "id", type: "string", required: false },
    ],
  },
  {
    type: "Heading",
    description: "Text heading (h1-h6)",
    props: [
      { name: "level", type: "1 | 2 | 3 | 4 | 5 | 6", required: true },
      { name: "text", type: "string", required: true },
    ],
  },
  {
    type: "Paragraph",
    description: "Block of text",
    props: [{ name: "text", type: "string", required: true }],
  },
  {
    type: "Image",
    description: "Image element",
    props: [
      { name: "src", type: "string", required: true },
      { name: "alt", type: "string", required: true },
      { name: "width", type: "number", required: false },
      { name: "height", type: "number", required: false },
    ],
  },
  {
    type: "Link",
    description: "Anchor / hyperlink",
    props: [
      { name: "href", type: "string", required: true },
      { name: "text", type: "string", required: true },
      { name: "external", type: "boolean", required: false },
    ],
  },
  {
    type: "Card",
    description: "Content card with title, description, and optional image",
    props: [
      { name: "title", type: "string", required: true },
      { name: "description", type: "string", required: true },
      { name: "image", type: "string", required: false },
    ],
  },
  {
    type: "List",
    description: "Ordered or unordered list",
    props: [
      { name: "items", type: "string[]", required: true },
      { name: "ordered", type: "boolean", required: true },
    ],
  },
  {
    type: "Table",
    description: "Data table with headers and rows",
    props: [
      { name: "headers", type: "string[]", required: true },
      { name: "rows", type: "string[][]", required: true },
    ],
  },
  {
    type: "Badge",
    description: "Small label / badge",
    props: [
      { name: "text", type: "string", required: true },
      {
        name: "variant",
        type: '"default" | "secondary" | "outline" | "destructive"',
        required: false,
      },
    ],
  },
  {
    type: "Button",
    description: "Clickable button, optionally linking somewhere",
    props: [
      { name: "text", type: "string", required: true },
      { name: "href", type: "string", required: false },
      {
        name: "variant",
        type: '"default" | "secondary" | "outline" | "ghost"',
        required: false,
      },
    ],
  },
  {
    type: "Hero",
    description: "Hero / banner section with title, subtitle, and CTA",
    props: [
      { name: "title", type: "string", required: true },
      { name: "subtitle", type: "string", required: false },
      { name: "cta", type: "string", required: false },
      { name: "ctaHref", type: "string", required: false },
    ],
  },
  {
    type: "Nav",
    description: "Navigation bar with link items",
    props: [
      {
        name: "items",
        type: "Array<{ text: string; href: string }>",
        required: true,
      },
    ],
  },
  {
    type: "Footer",
    description: "Page footer with text and optional links",
    props: [
      { name: "text", type: "string", required: true },
      {
        name: "links",
        type: "Array<{ text: string; href: string }>",
        required: false,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// getCatalogPromptText – produces a human-readable catalog for AI prompts
// ---------------------------------------------------------------------------

export function getCatalogPromptText(): string {
  const lines: string[] = [
    "# json-render Component Catalog",
    "",
    "Available component types and their props:",
    "",
  ];

  for (const entry of CATALOG) {
    lines.push(`## ${entry.type}`);
    lines.push(`${entry.description}`);
    lines.push("");
    lines.push("| Prop | Type | Required |");
    lines.push("| ---- | ---- | -------- |");
    for (const p of entry.props) {
      lines.push(
        `| ${p.name} | \`${p.type}\` | ${p.required ? "yes" : "no"} |`
      );
    }
    lines.push("");
  }

  lines.push("## Document structure");
  lines.push("");
  lines.push("```json");
  lines.push("{");
  lines.push('  "root": "<element-id>",');
  lines.push('  "elements": {');
  lines.push('    "<element-id>": {');
  lines.push('      "type": "<ComponentType>",');
  lines.push('      "props": { ... },');
  lines.push('      "children": ["<child-element-id>", ...]');
  lines.push("    }");
  lines.push("  }");
  lines.push("}");
  lines.push("```");

  return lines.join("\n");
}
