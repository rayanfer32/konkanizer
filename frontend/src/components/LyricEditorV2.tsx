import { useState, useCallback, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
// import { api, storage } from './lib/supabase'

const STORAGE_KEYS = {
  ORIGINAL: "lyrics-editor-original",
  MY: "lyrics-editor-my",
};

export default function LyricEditorV2() {
  const [originalLyrics, setOriginalLyrics] = useState("");
  const [myLyrics, setMyLyrics] = useState("");
  const [wordDefinitions, setWordDefinitions] = useState({});
  const [loading, setLoading] = useState({});

  // Load saved lyrics from localStorage
  useEffect(() => {
    return
    const savedOriginal = storage.getFromLocalStorage(STORAGE_KEYS.ORIGINAL);
    const savedMy = storage.getFromLocalStorage(STORAGE_KEYS.MY);

    if (savedOriginal) setOriginalLyrics(savedOriginal);
    if (savedMy) setMyLyrics(savedMy);
  }, []);

  // Save to localStorage when lyrics change
  useEffect(() => {
    return
    storage.saveToLocalStorage(STORAGE_KEYS.ORIGINAL, originalLyrics);
    storage.saveToLocalStorage(STORAGE_KEYS.MY, myLyrics);
  }, [originalLyrics, myLyrics]);

  const fetchWordDefinition = useCallback(
    async (word) => {
      if (wordDefinitions[word] || loading[word]) return;

      setLoading((prev) => ({ ...prev, [word]: true }));

      try {
        const definition = await api.getFromKD(word);
        setWordDefinitions((prev) => ({
          ...prev,
          [word]: definition,
        }));
      } catch (error) {
        console.error(`Error fetching definition for ${word}:`, error);
        setWordDefinitions((prev) => ({
          ...prev,
          [word]: "Definition not found",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [word]: false }));
      }
    },
    [wordDefinitions, loading]
  );

  const handleSaveToDb = useCallback(async () => {
    try {
      await api.addToDb({
        original: originalLyrics,
        translated: myLyrics,
      });
      alert("Saved successfully!");
    } catch (error) {
      console.error("Error saving to DB:", error);
      alert("Error saving to database");
    }
  }, [originalLyrics, myLyrics]);

  const renderLyricsWithTooltips = useCallback(() => {
    if (!originalLyrics) return null;

    return originalLyrics.split(/\s+/).map((word, index) => (
      <Popover key={`${word}-${index}`}>
        <PopoverTrigger asChild>
          <span
            className="inline-block hover:bg-gray-100 cursor-pointer px-1 rounded"
            onMouseEnter={() => fetchWordDefinition(word)}
          >
            {word}
          </span>
        </PopoverTrigger>
        <PopoverContent className="bg-white p-3 rounded-lg shadow-lg border">
          <div className="text-sm">
            <p className="font-semibold">{word}</p>
            <p className="text-gray-600">
              {loading[word]
                ? "Loading..."
                : wordDefinitions[word] || "Hover to load definition"}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    ));
  }, [originalLyrics, wordDefinitions, loading, fetchWordDefinition]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSaveToDb}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save to Database
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Original Lyrics */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Original Lyrics</h2>
            <textarea
              value={originalLyrics}
              onChange={(e) => setOriginalLyrics(e.target.value)}
              className="w-full h-[500px] p-2 border rounded resize-none"
              placeholder="Paste original lyrics here..."
            />
          </div>

          {/* Word Lookup */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Word Lookup</h2>
            <div className="min-h-[500px] p-2 border rounded whitespace-pre-wrap">
              {renderLyricsWithTooltips()}
            </div>
          </div>

          {/* My Lyrics */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">My Lyrics</h2>
            <textarea
              value={myLyrics}
              onChange={(e) => setMyLyrics(e.target.value)}
              className="w-full h-[500px] p-2 border rounded resize-none"
              placeholder="Write your lyrics here..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
