import express from 'express';
import cors from 'cors';
import { JSDOM } from 'jsdom';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

interface TranslationResult {
  noun?: string[];
  verb?: string[];
}

// Proxy endpoint
app.post('/translate', async (req, res) => {
  try {
    const q = req.body.word;
    const resp = await fetch("http://www.thekonkanidictionary.com/search.asp", {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.7",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
      },
      body: `sword=${q}&B1=Submit`,
      method: "POST",
      credentials: "include",
    });

    const htmlData = await resp.text();
    const dom = new JSDOM(htmlData);
    const document = dom.window.document;
    
    const tempObj: TranslationResult = {};

    const head2Elements = document.querySelectorAll(".head2");
    head2Elements.forEach((el: Element, index: number) => {
      const tdString = el.parentElement?.textContent || '';
      const transString = tdString
        .split("\n")
        .filter((line: string) => line !== "")
        .map((line: string) => line.trim());

      if (index === 0) {
        tempObj["noun"] = transString;
      }
      if (index === 1) {
        tempObj["verb"] = transString;
      }
    });

    res.json(tempObj);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
