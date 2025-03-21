import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import LyricsTranslator from "./components/LyricEditor";

interface Translation {
  noun?: string[];
  verb?: string[];
}

function App() {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
      });
      const data = await response.json();
      setTranslation(data);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 h-full min-h-screen bg-gray-50">
      <h1 className="text-3xl text-slate-700 font-bold text-center p-4">Konkanizer</h1>
      <LyricsTranslator />
    </div>
  );
}

export default App;
