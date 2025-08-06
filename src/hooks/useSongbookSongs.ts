//src/hooks/useSongbookSongs.ts
import { useState, useEffect } from "react";

export type SongbookOption = "us" | "es" | "aus";

export interface RawBookSong {
  song_number: number;
  title: string;
  lyrics: string;
  key: number;
  writer: string;
  copyright: string;
  CCLI: string | number;
  themes: string[];
  [k: string]: any;
}

export interface BookSong {
  songNumber: number;
  title: string;
  lyrics: string;
  rawLyrics: string;
  key: number;
  writer: string;
  copyright: string;
  CCLI: string | number;
  themes: string[];
}

const PATHS: Record<SongbookOption, string> = {
  us: "/us_songs.json",
  es: "/es_songs.json",
  aus: "/aus_songs.json",
};

/**
 * Clean for display: drop lines with '|', trim, drop empty, strip asterisks.
 */
export function cleanLyrics(text: string): string {
  return text
    .split("\n")
    .filter((line) => !line.includes("|"))
    .map((l) => l.trim())
    .filter((l) => l !== "")
    .map((l) => l.replace(/\*/g, ""))
    .join("\n");
}

/**
 * Splits raw lyrics into slides using these rules:
 *  - Lines with '|' are removed.
 *  - A repeat token like *x3*, *x2*, *2x* forces its own break: if inline it is split
 *    off so the preceding text stays and the token becomes a standalone slide.
 *  - Any other line containing '*' is treated as a break token: it usually starts a new slide.
 *  - Normal lines accumulate up to 4 per slide.
 *  - All asterisks are stripped for display.
 */
export function splitLyricsToSlides(rawLyrics: string): { section: string; lines: string[] }[] {
  const stripAsterisks = (s: string) => s.replace(/\*/g, "");

  const originalLines = rawLyrics
    .split("\n")
    .filter((line) => !line.includes("|"))
    .map((l) => l.trim())
    .filter((l) => l !== "");

  const slides: { section: string; lines: string[] }[] = [];
  let current: string[] = [];

  const flushCurrent = () => {
    if (current.length) {
      slides.push({ section: "Lyrics", lines: current });
      current = [];
    }
  };

  const repeatTokenRegex = /(\*(?:x\d+|\d+x)\*)/i;

  for (const orig of originalLines) {
    const repeatMatch = orig.match(repeatTokenRegex);
    if (repeatMatch) {
      const token = repeatMatch[1]; // e.g. "*x2*"
      const before = orig.replace(token, "").trim();

      if (before) {
        if (current.length === 4) {
          flushCurrent();
        }
        current.push(stripAsterisks(before));
        if (current.length === 4) {
          flushCurrent();
        }
      }

      flushCurrent();
      current.push(stripAsterisks(token));
      flushCurrent();
      continue;
    }

    const hasAsterisk = /\*/.test(orig);
    const cleaned = stripAsterisks(orig);

    if (hasAsterisk) {
      flushCurrent();
      current.push(cleaned);
      if (current.length === 4) {
        flushCurrent();
      }
    } else {
      if (current.length === 4) {
        flushCurrent();
      }
      current.push(cleaned);
      if (current.length === 4) {
        flushCurrent();
      }
    }
  }

  flushCurrent();
  return slides;
}

export function useSongbookSongs(songbook: SongbookOption) {
  const [songs, setSongs] = useState<BookSong[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(PATHS[songbook])
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${PATHS[songbook]}: ${res.statusText}`);
        return res.json();
      })
      .then((data: RawBookSong[]) => {
        if (cancelled) return;
        const normalized: BookSong[] = data.map((raw) => ({
          songNumber: raw.song_number,
          title: raw.title,
          lyrics: cleanLyrics(raw.lyrics),
          rawLyrics: raw.lyrics,
          key: raw.key,
          writer: raw.writer,
          copyright: raw.copyright,
          CCLI: raw.CCLI,
          themes: raw.themes || [],
        }));
        setSongs(normalized);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [songbook]);

  return { songs, loading, error };
}