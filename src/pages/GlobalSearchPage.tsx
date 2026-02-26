import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Logo — larger version of the sidebar logo
// ---------------------------------------------------------------------------

function MbuxLogo() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-foreground/5">
      <svg
        width="52"
        height="52"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#gs_filter)">
          <g clipPath="url(#gs_clip)">
            <path
              d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z"
              fill="white"
            />
            <rect x="3" y="2" width="32" height="32" rx="2" fill="#1D2939" />
            <path
              opacity="0.3"
              d="M12.4268 10.96H10.2021V24.0664H12.4268V25.251H8.84766V9.77441H12.4268V10.96ZM29.1113 25.251H25.5332V24.0664H27.7578V10.96H25.5332V9.77441H29.1113V25.251Z"
              fill="white"
            />
            <path
              d="M18.7175 12.2401L17.8554 18.023L13.3094 21.6648C13.2542 21.7961 13.2095 21.9317 13.1758 22.0703C13.3103 22.1166 13.45 22.1458 13.5917 22.157L18.9991 20.0159L24.4086 22.1599C24.55 22.1487 24.6895 22.1195 24.8238 22.0732C24.7962 21.933 24.7516 21.7968 24.6909 21.6677L20.1442 18.0245L19.2821 12.2416C19.2016 12.1228 19.1065 12.0147 18.9991 11.9199C18.8926 12.0147 18.798 12.1223 18.7175 12.2401Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="gs_clip">
              <path
                d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z"
                fill="white"
              />
            </clipPath>
          </defs>
        </g>
        <defs>
          <filter
            id="gs_filter"
            x="0"
            y="0"
            width="38"
            height="38"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.039 0 0 0 0 0.051 0 0 0 0 0.071 0 0 0 0.06 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function GlobalSearchPage() {
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to search API
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Global Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          If you're not sure where to look for anything, start here
        </p>
      </div>

      <hr className="mx-6 mt-5 border-border" />

      {/* Search area */}
      <div className="flex flex-col items-center px-6 pt-16">
        {/* Branding */}
        <div className="mb-8 flex items-center gap-4">
          <MbuxLogo />
          <span className="text-3xl font-bold tracking-tight text-foreground">
            MBUX Suite
          </span>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-2xl items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-14 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </span>
          </div>
          <Button type="submit" className="h-10 px-5">
            Search
          </Button>
        </form>
      </div>
    </div>
  );
}
