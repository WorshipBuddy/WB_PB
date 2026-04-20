# Bible Import Format

The Bible import functionality allows you to import custom Bible versions in JSON format.

## How to Use

1. Navigate to the Bible section in the app
2. Click the "Import Version" button in the left sidebar
3. Enter a name for your Bible version (e.g., "ESV", "NIV", "NASB")
4. Select a JSON file that contains your Bible data
5. Click "Import" to add the version to your library

## JSON Format

Your Bible JSON file should follow this structure:

```json
{
  "version": "Your Bible Version Name",
  "description": "Optional description of the version",
  "books": [
    {
      "name": "Book Name",
      "abbreviation": "Book Abbreviation",
      "testament": "old" or "new",
      "chapters": 50,
      "verses": [
        {
          "book": "Book Name",
          "chapter": 1,
          "verse": 1,
          "text": "Verse text content"
        }
      ]
    }
  ]
}
```

## Sample File

A sample Bible import file is available at `/sample-bible-import.json` in the app. You can download this file to see the exact format expected.

## Requirements

- File must be in JSON format
- Must contain a `books` array
- Each book must have `name`, `abbreviation`, `testament`, `chapters`, and `verses` properties
- Each verse must have `book`, `chapter`, `verse`, and `text` properties
- The `testament` field should be either "old" or "new"

## Notes

- Currently, imported Bible versions are logged to the console for debugging
- Future updates will include the ability to switch between different Bible versions
- The import validates that the file contains the required structure before importing
