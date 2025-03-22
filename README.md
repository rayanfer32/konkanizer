# Konkanize

### Todo
* It is a LyricsEditor app which has 3 columns - OrignalLyrics, WordLookup, MyLyrics
* Original lyrics - place where user can paste the lyrics
* WordLookup - the orginal lyrics should be tokenized and upon hovering over the word show the word meaning in a popover
* MyLyrics - Blank textarea with spellcheck off 
* Techstack - bun.js, vite, react, shadcn, supabase, cloudflare workers 
* Make the app injectible as contentscript of the app
* Develop APIs -> addToDb, getFromDb, getFromKD, saveToLocalStorage, getFromLocalStorage
* Use supabase for DB

### Future Dev
* Check Hono.js workers for backend / Vercel app

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

