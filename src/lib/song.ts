export interface SongSection {
    title: string;
    content: string;
}

export interface Song {
    songNumber: number;
    title: string;
    author: string;
    sections: SongSection[];
}