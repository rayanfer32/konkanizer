"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LyricsTranslator() {
  const [lyrics, setLyrics] = useState("");
  const [translation, setTranslation] = useState("");
  const [hoveredWord, setHoveredWord] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState(true);

  // Debounce the translation request to avoid too many API calls
  const handleWordHover = async (word: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!word.trim() || word === hoveredWord) return;

    timeoutRef.current = setTimeout(async () => {
      setHoveredWord(word);
      setIsLoading(true);

      try {
        const response = await translateWord(word);
        setWordTranslation(response);
      } catch (error) {
        toast("Failed to translate word");
        setWordTranslation("Translation failed");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // This function would call your translation API
  const translateWord = async (word: string): Promise<string> => {
    // Replace this with your own translation API
    const response = await fetch("http://localhost:3000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word }),
    });
    const data = await response.json();
    console.log("data", data);
    return JSON.stringify(data);
  };

  const renderLyricsWithHover = () => {
    if (!lyrics) return null;

    return lyrics.split("\n").map((line, lineIndex) => (
      <div key={`line-${lineIndex}`} className="mb-2">
        {line
          .split(/\s+/)
          .filter((word) => word.length > 0)
          .map((word, wordIndex) => (
            <Popover key={`word-${lineIndex}-${wordIndex}`}>
              <PopoverTrigger asChild>
                <span
                  className="inline-block hover:bg-yellow-500 px-1 py-0.5 rounded cursor-pointer"
                  onMouseEnter={() => handleWordHover(word)}
                >
                  {word}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 text-gray-800 bg-gray-200 border-gray-700">
                {isLoading && hoveredWord === word ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <div>{wordTranslation}</div>
                )}
              </PopoverContent>
            </Popover>
          ))
          .reduce((prev, curr, i) => {
            return i === 0 ? [curr] : [...prev, " ", curr];
          }, [] as React.ReactNode[])}
      </div>
    ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark">
      <Card className="p-4 text-gray-900 border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Original Lyrics</h2>
          <Collapsible
            open={isLyricsOpen}
            onOpenChange={setIsLyricsOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <button className="p-1 rounded-md hover:bg-gray-800">
                {isLyricsOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        <Textarea
          placeholder="Enter lyrics in English here..."
          className="min-h-[640px] mb-4 text-gray-800 border-gray-200  placeholder:text-gray-400"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
        />
      </Card>

      <Collapsible
        open={isLyricsOpen}
        onOpenChange={setIsLyricsOpen}
        className="w-full"
      >
        <Card className="p-4 text-gray-900 border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Word Lookup</h2>
          <CollapsibleContent>
            <div className="min-h-[640px] border border-gray-200 rounded-md p-4 max-h-[400px] overflow-auto text-gray-800">
              {renderLyricsWithHover()}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="p-4 text-gray-900 border-gray-200">
        <h2 className="text-xl font-semibold mb-3">Your Translation</h2>
        <Textarea
          placeholder="Write your translation here..."
          className="min-h-[640px] text-gray-800 border-gray-200 bg-white placeholder:text-gray-400"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          spellCheck={false}
        />
      </Card>
      <Toaster />
    </div>
  );
}
