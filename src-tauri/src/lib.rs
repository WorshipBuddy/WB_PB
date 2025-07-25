use serde::Deserialize;
use serde_json::Value;
use reqwest;
use regex::Regex;
use serde::Serialize;


#[derive(Deserialize, Debug)]
struct SongInSet {
    song_number: i32,
    title: String,
    lyrics: String,
    writer: String,
}

#[derive(Deserialize, Debug)]
struct SetContent {
    set_data: Vec<SongInSet>,
}

#[derive(Serialize)]
pub struct SongSection {
    pub title: String,
    pub content: String,
}

#[derive(Serialize)]
pub struct Song {
    pub song_number: i32,
    pub title: String,
    pub author: String,
    pub sections: Vec<SongSection>,
}

#[tauri::command]
async fn fetch_and_process_songs(set_number: String) -> Result<Vec<Song>, String> {
    let url = format!("https://api.worshipbuddy.org/liveset/V2/S{}/data", set_number);
    let mut songs: Vec<Song> = Vec::new();

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let json: Value = response
        .json()
        .await
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    let set_data: SetContent = serde_json::from_value(json.clone())
        .map_err(|e| format!("Deserialization error: {}", e))?;

    // For each song, process the lyrics
    for song in set_data.set_data {
        let sections = process_lyrics(&song.lyrics);
        let s = Song {
            song_number: song.song_number,
            title: song.title.clone(),
            author: song.writer.clone(),
            sections,
        };
        songs.push(s);
    }

    Ok(songs)
}

fn process_lyrics(data: &str) -> Vec<SongSection> {
    // Step 1: Replace escaped newlines with actual newlines
    let mut data = data.replace("\\n", "\n");

    // Step 2: Clean up lines and remove lines that match `|number|`
    let lines: Vec<String> = data
        .lines()
        .filter(|line| !Regex::new(r"\|\d+\|").unwrap().is_match(line))
        .map(|line| {
            let trimmed = line.trim();
            let collapsed = Regex::new(r"\s+").unwrap().replace_all(trimmed, " ");
            collapsed.to_string()
        })
        .collect();
    data = lines.join("\n");

    // Step 3: Replace patterns
    let verse_re = Regex::new(r"\*(\d+)\.\*\s?").unwrap();
    data = verse_re
        .replace_all(&data, |caps: &regex::Captures| {
            replace_verse(&caps[1])
        })
        .into_owned();

    let chorus_re = Regex::new(r"\*Chorus:\*").unwrap();
    data = chorus_re.replace_all(&data, "[Chorus]\n").into_owned();

    let repeats_re = Regex::new(r"\*x(\d+)\*").unwrap();
    data = repeats_re
        .replace_all(&data, |caps: &regex::Captures| {
            replace_repeats(&caps[0]) // match whole
        })
        .into_owned();

    // Step 4: Clump words in same section
    let triple_newlines = Regex::new(r"\n{3,}").unwrap();
    data = triple_newlines.replace_all(&data, "\n\n").into_owned();

    // Step 5: Put data into sections
    let mut sections = Vec::new();
    let mut current_title = String::new();
    let mut current_content = String::new();

    for line in data.lines() {
        if let Some(caps) = Regex::new(r"^\[(.+?)\]$").unwrap().captures(line.trim()) {
            // push previous section if exists
            if !current_title.is_empty() || !current_content.is_empty() {
                sections.push(SongSection {
                    title: current_title.clone(),
                    content: current_content.trim().to_string(),
                });
                current_content.clear();
            }
            current_title = caps[1].to_string(); // e.g. Verse 1 or Chorus
        } else {
            // normal lyric line
            if !current_content.is_empty() {
                current_content.push('\n');
            }
            current_content.push_str(line);
        }
    }

    // push the last section
    if !current_title.is_empty() || !current_content.is_empty() {
        sections.push(SongSection {
            title: current_title,
            content: current_content.trim().to_string(),
        });
    }

    sections
}

fn replace_verse(number: &str) -> String {
    format!("[Verse {}]\n", number)
}

fn replace_repeats(_matched: &str) -> String {
    // You can adjust this to whatever repeat logic you want
    String::new()
}


// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![fetch_and_process_songs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
