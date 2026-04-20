import { BibleVerse } from "../lib/bible";

interface BibleVerseDisplayProps {
  verse: BibleVerse;
  showReference?: boolean;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export default function BibleVerseDisplay({ 
  verse, 
  showReference = true, 
  fontSize = "4vh",
  textAlign = "center"
}: BibleVerseDisplayProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {showReference && (
        <div 
          className="text-white font-semibold mb-6"
          style={{ fontSize: `calc(${fontSize} * 0.75)` }}
        >
          {verse.book} {verse.chapter}:{verse.verse}
        </div>
      )}
      <div 
        className="text-white font-semibold leading-relaxed"
        style={{ 
          fontSize: fontSize,
          textAlign: textAlign
        }}
      >
        {verse.text}
      </div>
    </div>
  );
}
