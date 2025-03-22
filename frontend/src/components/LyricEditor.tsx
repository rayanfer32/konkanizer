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
  const [wordTranslation, setWordTranslation] = useState(null);
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
        setWordTranslation(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // This function would call your translation API
  const translateWord = async (word: string): Promise<any> => {
    //TODO : create a type for the response
    // Replace this with your own translation API
    const response = await fetch("http://localhost:3000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word }),
    });
    return await response.json();
  };

  const renderTranslation = (translation: any | null) => {
    if (translation) {
      return (
        <>
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-800 mb-1">Nouns:</p>
            <ul className="list-disc list-inside space-y-2">
              {translation?.noun?.map((word: string, index: number) => (
                <li key={index} className="text-gray-700 text-sm">
                  {word}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-800 mb-1">Verbs:</p>
            <ul className="list-disc list-inside space-y-2">
              {translation?.verb?.map((word: string, index: number) => (
                <li key={index} className="text-gray-700 text-sm">
                  {word}
                </li>
              ))}
            </ul>
          </div>
        </>
      );
    }
    return <p className="mb-1 text-gray-600">Defination not found!</p>;
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
                  className="inline-block hover:bg-yellow-100 px-2 py-0.5 rounded cursor-pointer"
                  onMouseEnter={() => handleWordHover(word)}
                >
                  {word}
                </span>
              </PopoverTrigger>
              <PopoverContent className="bg-white p-3 rounded-lg shadow-lg">
                {isLoading && hoveredWord === word ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  renderTranslation(wordTranslation)
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
