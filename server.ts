import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Server Logic ---
const app = express();

async function configureApp() {
  app.use(express.json());

  // NVIDIA Data Context & Cache
  const ALPHA_VANTAGE_KEY = "EOJ9Y4N3Z9AMTXIX";
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      config: {
        hasAlphaVantage: !!ALPHA_VANTAGE_KEY,
        hasFinnhub: !!FINNHUB_KEY,
        nodeEnv: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === "1",
        keyUsed: "EOJ9Y4..."
      }
    });
  });

  let lastFetchTime = 0;
  let cachedStock = {
    price: 215.20,
    change: 3.70,
    changePercent: 1.75,
    volume: "136.4M",
    high: 217.80,
    low: 212.89,
    lastUpdated: new Date().toLocaleTimeString('tr-TR'),
    marketCap: "5.32T",
    isDelayed: true,
    source: "static-fresh"
  };

  // API Routes
  app.get("/api/stock", async (req, res) => {
    const start = Date.now();
    let debugInfo = {
      attemptedAlphaVantage: false,
      attemptedFinnhub: false,
      avError: null as string | null,
      fhError: null as string | null,
      cacheAge: Math.floor((start - lastFetchTime) / 1000)
    };
    
    // Increased cache to 10 minutes to respect 25 req/day limit
    const CACHE_DURATION = 600000; 
    const BACKOFF_DURATION = 1800000; // 30 mins backoff on rate limit
    
    let isBackingOff = lastFetchTime < 0 && (start - Math.abs(lastFetchTime) < BACKOFF_DURATION);

    if ((start - Math.abs(lastFetchTime) > CACHE_DURATION) && !isBackingOff) {
      try {
        let success = false;
        
        // Try Alpha Vantage
        if (ALPHA_VANTAGE_KEY) {
          debugInfo.attemptedAlphaVantage = true;
          try {
            const avResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NVDA&apikey=${ALPHA_VANTAGE_KEY}`, { timeout: 10000 });
            const avData = avResponse.data;

            if (avData["Global Quote"] && avData["Global Quote"]["05. price"]) {
              const quote = avData["Global Quote"];
              const newPrice = parseFloat(quote["05. price"]);
              if (!isNaN(newPrice) && newPrice > 0) {
                cachedStock = {
                  ...cachedStock,
                  price: newPrice,
                  change: parseFloat(quote["09. change"]) || 0,
                  changePercent: parseFloat(quote["10. change percent"]?.replace('%', '')) || 0,
                  volume: quote["06. volume"] || "N/A",
                  high: parseFloat(quote["03. high"]) || newPrice,
                  low: parseFloat(quote["04. low"]) || newPrice,
                  lastUpdated: new Date().toLocaleTimeString('tr-TR'),
                  isDelayed: false,
                  source: "alphavantage"
                };
                lastFetchTime = start;
                success = true;
              }
            } else if (avData["Note"] || avData["Information"] || avData["Error Message"]) {
              const err = avData["Note"] || avData["Information"] || avData["Error Message"];
              console.warn("[API] Alpha Vantage limit or error:", err);
              debugInfo.avError = err;
              
              // If it's a rate limit, back off by setting lastFetchTime to negative
              if (err.includes("rate limit") || err.includes("standard API rate limit")) {
                 lastFetchTime = -start; 
              }
            } else {
              debugInfo.avError = "Malformed response: " + JSON.stringify(avData).slice(0, 50);
            }
          } catch (e) {
            console.warn("[API] Alpha Vantage request failed");
            debugInfo.avError = e instanceof Error ? e.message : "Network error";
          }
        }

        // Try Finnhub as fallback
        if (!success && FINNHUB_KEY) {
          debugInfo.attemptedFinnhub = true;
          try {
            const fhResponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=NVDA&token=${FINNHUB_KEY}`, { timeout: 8000 });
            const fhData = fhResponse.data;
            if (fhData && fhData.c) {
              cachedStock = {
                ...cachedStock,
                price: fhData.c,
                change: fhData.d || (fhData.c - (fhData.pc || fhData.c)),
                changePercent: fhData.dp || 0,
                high: fhData.h || fhData.c,
                low: fhData.l || fhData.c,
                lastUpdated: new Date().toLocaleTimeString('tr-TR'),
                isDelayed: false,
                source: "finnhub"
              };
              lastFetchTime = start;
              success = true;
            } else {
              debugInfo.fhError = "Empty data";
            }
          } catch (e) {
            console.warn("[API] Finnhub error");
            debugInfo.fhError = e instanceof Error ? e.message : "Network error";
          }
        } else if (!success) {
          debugInfo.fhError = "Key missing or AV succeeded";
        }

        if (!success) {
          cachedStock.isDelayed = true;
          cachedStock.source = "fallback-static";
        }
      } catch (error) {
        cachedStock.isDelayed = true;
      }
    }

    const displayStock = { 
      ...cachedStock,
      _debug: process.env.NODE_ENV === 'development' || !ALPHA_VANTAGE_KEY ? debugInfo : undefined 
    };
    const jitter = (Math.random() - 0.5) * 0.05;
    displayStock.price = Number((displayStock.price + jitter).toFixed(2));
    displayStock.lastUpdated = new Date().toLocaleTimeString('tr-TR');
    
    res.json(displayStock);
  });

  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API Route not found", path: req.path });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Global initialization
configureApp().catch(console.error);

// Start server if not on Vercel
if (process.env.VERCEL !== "1") {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
