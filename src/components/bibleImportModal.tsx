import { useState } from "react";
import { Modal, Button, TextInput, FileInput, Text } from "@mantine/core";
import { IconUpload, IconFileText } from "@tabler/icons-react";

interface BibleImportModalProps {
  opened: boolean;
  onClose: () => void;
  onImport: (bibleData: any, versionName: string) => void;
}

export default function BibleImportModal({ opened, onClose, onImport }: BibleImportModalProps) {
  const [versionName, setVersionName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!selectedFile || !versionName.trim()) {
      setError("Please provide both a version name and select a file");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("Starting Bible import process...");
      console.log("File:", selectedFile.name);
      console.log("Version name:", versionName);

      const text = await selectedFile.text();
      console.log("File content loaded, length:", text.length);
      
      const bibleData = JSON.parse(text);
      console.log("JSON parsed successfully:", bibleData);

      // Basic validation
      if (!bibleData.books || !Array.isArray(bibleData.books)) {
        throw new Error("Invalid Bible file format. Expected 'books' array.");
      }

      console.log("Validation passed. Number of books:", bibleData.books.length);
      console.log("First book:", bibleData.books[0]);

      onImport(bibleData, versionName);
      onClose();
      setVersionName("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Bible import error:", err);
      setError(err instanceof Error ? err.message : "Failed to import Bible file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Import Bible Version" size="md">
      <div className="space-y-4">
        <Text size="sm" c="dimmed">
          Import a custom Bible version from a JSON file. The file should contain a 'books' array with book, chapter, and verse data. 
          You can use the sample-bible-import.json file in the project root as a reference for the expected format.
        </Text>

        <TextInput
          label="Version Name"
          placeholder="e.g., ESV, NIV, NASB"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
          required
        />

        <FileInput
          label="Bible JSON File"
          placeholder="Select a JSON file"
          accept=".json"
          value={selectedFile}
          onChange={setSelectedFile}
          leftSection={<IconFileText size={16} />}
          required
        />

        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            loading={isLoading}
            disabled={!selectedFile || !versionName.trim()}
            leftSection={<IconUpload size={16} />}
          >
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
