'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import { Button, TextInput, Divider, Textarea } from "@mantine/core";
import { Song } from "../lib/song";
import { emit } from '@tauri-apps/api/event';
import { splitLyricsToSlides } from "../hooks/useSongbookSongs";

interface SongEditorProps {
  initialSong: Song;
  onSave: (updated: Song) => void;
  onCancel: () => void;
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Given raw lyrics with *markers*, produce HTML for the highlight layer:
 * - Replace *bold* with <strong style="color: black;">bold</strong>
 * - Preserve line breaks
 * Only the asterisk-wrapped portions are visible (rest is transparent).
 */
function makeHighlightHtml(raw: string) {
  let escaped = escapeHtml(raw);
  escaped = escaped.replace(/\*(.+?)\*/g, (_, inner) => {
    return `<strong style="color: black;">${escapeHtml(inner)}</strong>`;
  });
  escaped = escaped.replace(/\n/g, "<br/>");
  return escaped;
}

/**
 * Normalize incoming lyrics so that each computed slide/block gets separated
 * by a blank line in the editor. Uses the existing split logic to infer blocks.
 */
function normalizeForEditor(raw: string) {
  const slides = splitLyricsToSlides(raw);
  return slides.map((s) => s.lines.join("\n")).join("\n\n");
}

export default function SongEditor({ initialSong, onSave, onCancel }: SongEditorProps) {
  const [title, setTitle] = useState(initialSong.title);
  const [author, setAuthor] = useState(initialSong.author);
  const [lyricsText, setLyricsText] = useState(
    initialSong.sections.find((s) => s.title === "Lyrics")?.content || ""
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    const raw = initialSong.sections.find((s) => s.title === "Lyrics")?.content || "";
    setLyricsText(normalizeForEditor(raw));
    initializedRef.current = true;
  }, [initialSong]);

  const computedSlides = useMemo(() => splitLyricsToSlides(lyricsText), [lyricsText]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  useEffect(() => {
    if (computedSlides.length === 0) {
      setActiveSlideIndex(0);
      return;
    }
    if (
      activeSlideIndex >= computedSlides.length ||
      computedSlides[activeSlideIndex]?.lines.length === 0
    ) {
      const firstNonEmpty = computedSlides.findIndex((s) => s.lines.length > 0);
      setActiveSlideIndex(firstNonEmpty === -1 ? 0 : firstNonEmpty);
    }
  }, [computedSlides, activeSlideIndex]);

  const currentBlockLines = computedSlides[activeSlideIndex]?.lines || [];

  useEffect(() => {
    emit("projector:update", {
      lines: currentBlockLines,
    });
  }, [currentBlockLines]);

  const blockCount = computedSlides.length;

  const buildUpdatedSong = (): Song => ({
    ...initialSong,
    title,
    author,
    sections: [{ title: "Lyrics", content: lyricsText }],
    slides: computedSlides,
  });

  const onTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <TextInput label="Author" value={author} onChange={(e) => setAuthor(e.currentTarget.value)} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => onSave(buildUpdatedSong())}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col flex-1 overflow-auto mt-4">
        <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-medium">Blocks: {blockCount}</div>
        </div>

        <div className="relative flex-1 min-h-0">
          <div
            ref={(el) => {
              highlightRef.current = el;
            }}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded border border-gray-300 text-sm"
            style={{
              fontFamily: "inherit",
              lineHeight: 1.3,
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              padding: "12px",
              boxSizing: "border-box",
              color: "transparent", // base text invisible
              WebkitTextFillColor: "transparent",
            }}
            dangerouslySetInnerHTML={{ __html: makeHighlightHtml(lyricsText) }}
          />

          <Textarea
            ref={(el) => {
              textareaRef.current = el;
            }}
            value={lyricsText}
            onChange={(e) => setLyricsText(e.currentTarget.value)}
            onScroll={onTextareaScroll}
            autosize
            minRows={12}
            maxRows={60}
            className="relative bg-transparent font-sans text-sm"
            styles={{
              root: { position: "relative", zIndex: 1 },
              input: {
                background: "transparent",
                fontFamily: "inherit",
                lineHeight: 1.3,
                whiteSpace: "pre-wrap",
                overflow: "auto",
                padding: "12px",
                boxSizing: "border-box",
                resize: "none",
              },
            }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Edit the lyrics directly. Each block/slide is inferred from line breaks plus the asterisk rule (asterisk-wrapped text is considered a break marker and is shown bold). Slides are visually separated in the editor by blank lines. Line breaks you enter determine block division (4-line default unless overridden by asterisk).
        </p>
      </div>
    </div>
  );
}