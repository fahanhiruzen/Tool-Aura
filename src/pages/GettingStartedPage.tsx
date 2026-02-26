import { FileText, BookOpen, Layers, FolderOpen, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Thumbnail placeholders (dark-background previews inside the media cards)
// ---------------------------------------------------------------------------

function CreateProjectThumbnail() {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-slate-900 p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-white">Create a</p>
        <p className="text-xs font-semibold text-white">project</p>
        <p className="mt-1 text-[9px] leading-relaxed text-slate-400">
          All work files are nested in projects in the
          respective team workspaces. See here how.
        </p>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-700">
          <FolderOpen className="h-4 w-4 text-slate-300" />
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-700">
          <FileText className="h-3 w-3 text-slate-300" />
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-700">
          <FileText className="h-3 w-3 text-slate-300" />
        </div>
      </div>
    </div>
  );
}

function LibraryThumbnail({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-slate-900 p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-white">Use a library -</p>
        <p className="text-xs font-semibold text-white">{label}</p>
      </div>
      <div className="flex items-end justify-end">
        <Library className="h-10 w-10 text-slate-500" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card variants
// ---------------------------------------------------------------------------

interface ResourceCardProps {
  thumbnail: React.ReactNode;
  title: string;
  category: string;
  buttonLabel: string;
  onAction?: () => void;
}

function ResourceCard({
  thumbnail,
  title,
  category,
  buttonLabel,
  onAction,
}: ResourceCardProps) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="w-[38%] shrink-0">{thumbnail}</div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-base font-semibold leading-snug">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{category}</p>
        </div>
        <Button size="sm" className="mt-4 w-fit" onClick={onAction}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

interface DocumentCardProps {
  title: string;
  category: string;
  fileName: string;
  fileSize: string;
  buttonLabel: string;
  onAction?: () => void;
}

function DocumentCard({
  title,
  category,
  fileName,
  fileSize,
  buttonLabel,
  onAction,
}: DocumentCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{category}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-100">
            <FileText className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          </div>
        </div>
        <Button size="sm" className="shrink-0" onClick={onAction}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const RESOURCES: Array<
  | ({ type: "resource" } & Omit<ResourceCardProps, "onAction">)
  | ({ type: "document" } & Omit<DocumentCardProps, "onAction">)
> = [
  {
    type: "resource",
    thumbnail: <CreateProjectThumbnail />,
    title: "How to setup a new Document",
    category: "Figma Training",
    buttonLabel: "Open Training",
  },
  {
    type: "document",
    title: "Concept File Overview",
    category: "Cheat Sheet",
    fileName: "concept-file-cheat-sheet.pdf",
    fileSize: "200 KB",
    buttonLabel: "Download Cheat Sheet",
  },
  {
    type: "resource",
    thumbnail: <LibraryThumbnail label="Insert components" />,
    title: "Start by Adding some Components",
    category: "Figma",
    buttonLabel: "Open Asset Panel",
  },
  {
    type: "resource",
    thumbnail: <LibraryThumbnail label="Insert" />,
    title: "MBUX Way of working",
    category: "Figma",
    buttonLabel: "Open File",
  },
  {
    type: "resource",
    thumbnail: (
      <div className="flex h-full w-full flex-col justify-between bg-slate-900 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-white">Explore</p>
          <p className="text-xs font-semibold text-white">components</p>
        </div>
        <Layers className="h-10 w-10 text-slate-500" />
      </div>
    ),
    title: "Explore MBUX Components",
    category: "Figma",
    buttonLabel: "Open Components",
  },
  {
    type: "resource",
    thumbnail: (
      <div className="flex h-full w-full flex-col justify-between bg-slate-900 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-white">Design</p>
          <p className="text-xs font-semibold text-white">guidelines</p>
        </div>
        <BookOpen className="h-10 w-10 text-slate-500" />
      </div>
    ),
    title: "MBUX Design Guidelines",
    category: "Documentation",
    buttonLabel: "Open Guidelines",
  },
];

export function GettingStartedPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Getting Started</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your new Document&nbsp;—&nbsp;it looks great! Here&apos;s a
          few pointers to get you started.
        </p>
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Cards */}
      <div className={cn("flex flex-col gap-4 px-6 py-5")}>
        {RESOURCES.map((item, i) =>
          item.type === "document" ? (
            <DocumentCard key={i} {...item} />
          ) : (
            <ResourceCard key={i} {...item} />
          )
        )}
      </div>
    </div>
  );
}
