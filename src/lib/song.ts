export interface SongSection {
    title: string;
    content: string;
}

export interface RawSong {
    song_number: number;
    title: string;
    author: string;
    sections: SongSection[];
}

export interface Song {
    songNumber: number;
    title: string;
    author: string;
    sections: SongSection[];
    slides: Slide[];
}

export interface Slide {
    section: string;
    lines: string[];
}