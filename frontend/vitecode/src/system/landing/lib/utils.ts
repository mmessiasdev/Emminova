import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractYouTubeId(url: string) {
  if (!url) return null;

  const cleanUrl = url.trim();

  const directIdMatch = cleanUrl.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directIdMatch) return directIdMatch[0];

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const byQuery = parsed.searchParams.get('v');
      if (byQuery && byQuery.length === 11) return byQuery;

      const segments = parsed.pathname.split('/').filter(Boolean);
      const markers = ['embed', 'v', 'shorts', 'live'];

      for (let i = 0; i < segments.length - 1; i++) {
        if (markers.includes(segments[i])) {
          const id = segments[i + 1];
          return id && id.length === 11 ? id : null;
        }
      }
    }
  } catch {
    // Fallback para formatos inesperados
  }

  const fallbackMatch = cleanUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&/]|$)/);
  return fallbackMatch ? fallbackMatch[1] : null;
}


