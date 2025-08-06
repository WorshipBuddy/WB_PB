//src/utils/songSearch.ts
export const keyNames = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dm",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gm",
  "Abm",
  "Am",
  "Bbm",
  "Bm",
];

export function removePunctuation(text: string) {
  return text.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
}

export function filterBookSongs(
  songs: Array<{
    songNumber: number;
    title: string;
    lyrics: string;
    key: number;
    themes?: string[];
  }>,
  query: string
) {
  const sanitized = removePunctuation(query).toLowerCase().trim();

  if (sanitized === "") return songs;

  if (sanitized.startsWith("key ")) {
    const keySearch = sanitized.slice(4).trim();
    return songs.filter((song) => {
      const name = keyNames[song.key] || "";
      return removePunctuation(name).toLowerCase().includes(keySearch);
    });
  }

  if (/^\d+$/.test(sanitized)) {
    return songs.filter((song) => song.songNumber.toString().includes(sanitized));
  }

  return songs.filter((song) => {
    return (
      (song.title && removePunctuation(song.title).toLowerCase().includes(sanitized)) ||
      (song.lyrics && removePunctuation(song.lyrics).toLowerCase().includes(sanitized)) ||
      song.songNumber.toString().includes(sanitized)
    );
  });
}