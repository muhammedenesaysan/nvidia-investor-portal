import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Cpu, 
  Zap, 
  Globe, 
  ChevronRight, 
  BarChart3, 
  Layers, 
  Calendar,
  Activity,
  Box,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X,
  TrendingDown,
  DollarSign,
  Search,
  Menu,
  Bell,
  Sparkles,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  Legend
} from 'recharts';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

// --- External Assets ---
import { 
  StockData, 
  ProjectDetail, 
  TechSpecDetail, 
  NewsItem, 
  HeroSlide 
} from './types';
import { 
  TECH_SPECS, 
  PROJECTS, 
  HERO_SLIDES, 
  NEWS_FEED, 
  INITIAL_NVDA 
} from './constants';
import { NvidiaLogo } from './components/NvidiaLogo';
import { TechPanel } from './components/TechPanel';
import { SpecCallout } from './components/SpecCallout';
import { CustomTooltip } from './components/CustomTooltip';

// --- AI Service (Client-side) ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const generateAIContent = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    
    if (!response.text) {
      throw new Error('AI generation returned empty response');
    }
    
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};

// --- Mock Data (Moved outside to prevent re-creation) ---
const SECTOR_DATA = [
  { name: 'Ç1 2026', value: 175 },
  { name: 'Ç2 2026', value: 252 },
  { name: 'Ç3 2026', value: 630 },
  { name: '2026 HEDEF', value: 2500 },
];

const TECHNICAL_COMPARISON_DATA = [
  { x: 0, h100: 10, h200: 15, b100: 20 },
  { x: 1, h100: 15, h200: 25, b100: 45 },
  { x: 2, h100: 22, h200: 45, b100: 95 },
  { x: 3, h100: 35, h200: 80, b100: 220 },
  { x: 4, h100: 60, h200: 150, b100: 420 },
];

const PROJECTION_FACTOR = 1.68;

const RAW_REVENUE_DATA = [
  { name: 'Haziran 2025', Blackwell: 45, Omniverse: 30, DataCenter: 49.5, value: 124.50, note: 'STRATEJİK BAŞLANGIÇ' },
  { name: '2025 Yıl Sonu', Blackwell: 55, Omniverse: 35, DataCenter: 55.4, value: 145.40, note: '2025 KAPANIŞ ANALİZİ' },
  { name: 'Ocak 2026', Blackwell: 70, Omniverse: 40, DataCenter: 52.8, value: 162.80, note: 'B100 ÖN SİPARİŞ HIZI' },
  { name: 'Mart 2026', Blackwell: 85, Omniverse: 45, DataCenter: 52.15, value: 182.15, note: 'AI FABRİKA ENTEGRASYONU' },
  { name: 'Mayıs 2026 (ŞİMDİ)', Blackwell: 110, Omniverse: 50, DataCenter: 51.00, value: 215.20, note: 'CANLI VERİ AKIŞI', isLive: true },
  { name: '2026 Yıl Sonu Projeksiyonu', Blackwell: 210, Omniverse: 80, DataCenter: 66.5, value: 356.50, note: 'HEDEF: $356.50' },
  { name: '2027 Projeksiyonu', Blackwell: 300, Omniverse: 120, DataCenter: 65, value: 485.00, note: 'RUBİN MİMARİSİ: HBM4 VE GELECEK VİZYONU' },
];

export default function App() {
  const [stock, setStock] = useState<StockData>(INITIAL_NVDA);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [stockHistory, setStockHistory] = useState(Array.from({ length: 30 }, (_, i) => ({
    time: i,
    price: INITIAL_NVDA.price + (Math.random() - 0.5) * 5
  })));

  // Real-time Stock Sync from Server
  useEffect(() => {
    const fetchStock = async (isRetry = false) => {
      try {
        const response = await fetch('/api/stock');
        
        if (!response.ok) {
          // If the server is just starting, we might get a 404 or 502/503 from the platform
          if (response.status >= 500 || response.status === 404) {
             console.warn(`[Stock Sync] Server busy or starting (${response.status})`);
             return;
          }
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText.substring(0, 100));
          throw new Error(`Sunucu hatası: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const body = await response.text();
          // specifically detect the "Starting Server" placeholder
          if (body.includes("<title>Starting Server...</title>") || body.includes("Starting Server...")) {
            console.log("[Stock Sync] Server is still initializing, waiting...");
            return; 
          }
          console.error("Beklenmeyen yanıt formatı (JSON bekleniyordu)");
          throw new Error("Sunucu geçersiz formatta yanıt verdi.");
        }
        
        const data = await response.json();
        setStock(data);
        setApiError(null);
        setLastSyncTime(Date.now());
        
        setStockHistory(h => {
          const newH = [...h.slice(1), { time: Date.now(), price: data.price }];
          return newH;
        });
      } catch (error) {
        // Only show error if it's a real failure, not just a startup delay
        console.error("Hisse senedi verisi senkronizasyon hatası:", error);
        setApiError(error instanceof Error ? error.message : "Bağlantı hatası oluştu.");
      }
    };

    // Initial delay to allow server to finish booting
    const timer = setTimeout(() => {
      fetchStock();
    }, 2000);
    
    const interval = setInterval(fetchStock, 10000); // 10 seconds is more than enough for demo
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const [visibleCategories, setVisibleCategories] = useState(['Blackwell', 'Omniverse', 'DataCenter']);

  const toggleCategory = (category: string) => {
    setVisibleCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const [activeTab, setActiveTab] = useState('2026 HEDEFİ');
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<TechSpecDetail | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'SPEC' | 'PROJECT' | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isDrawerOpen) {
      timer = setTimeout(() => {
        setSelectedSpec(null);
        setSelectedProject(null);
        setDrawerType(null);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [isDrawerOpen]);

  const openDrawer = (type: 'SPEC' | 'PROJECT', data: any) => {
    if (type === 'SPEC') setSelectedSpec(data);
    else setSelectedProject(data);
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation State
  const [simMarketShare, setSimMarketShare] = useState(92.4);
  const [simAiAdoption, setSimAiAdoption] = useState(85.0);
  const [simTargetPrice, setSimTargetPrice] = useState(356.50);

  useEffect(() => {
    const baseTarget = 356.50;
    const shareFactor = (simMarketShare - 92.4) * 2.5;
    const adoptionFactor = (simAiAdoption - 85.0) * 1.8;
    setSimTargetPrice(baseTarget + shareFactor + adoptionFactor);
  }, [simMarketShare, simAiAdoption]);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<{
    comparison: string[];
    futureOutlook: string;
  } | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);

  const [isDeepAnalysisOpen, setIsDeepAnalysisOpen] = useState(false);
  const [deepAnalysisResult, setDeepAnalysisResult] = useState("");
  const [isGeneratingDeep, setIsGeneratingDeep] = useState(false);

  // Body Scroll Lock & ESC Key Listener
  const projectedTarget = stock.price * PROJECTION_FACTOR;

  const dynamicRevenueData = React.useMemo(() => {
    return RAW_REVENUE_DATA.map(d => {
      if (d.isLive) {
        return { ...d, value: stock.price };
      }
      if (d.name === '2026 Yıl Sonu Projeksiyonu') {
        const pTarget = stock.price * PROJECTION_FACTOR;
        return { ...d, value: pTarget, note: `HEDEF: $${(pTarget || 0).toFixed(2)}` };
      }
      return d;
    });
  }, [stock.price]);

  useEffect(() => {
    const isAnyModalOpen = isMobileMenuOpen || isDeepAnalysisOpen || isDrawerOpen || !!aiAnalysis;
    
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsDeepAnalysisOpen(false);
        closeDrawer();
        setAiAnalysis(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isMobileMenuOpen, isDeepAnalysisOpen, isDrawerOpen, aiAnalysis]);

  const generateDeepB100Analysis = async () => {
    if (isGeneratingDeep) return;
    setIsDeepAnalysisOpen(true);
    setIsGeneratingDeep(true);
    setDeepAnalysisResult("");

    try {
      const prompt = `NVIDIA B100 Blackwell mimarisini önceki nesillerle (H100 ve H200) detaylı bir şekilde karşılaştıran çok paragraflı, derinlemesine bir teknik analiz hazırla. Analiz şunları içermelidir:
1. Performans: Ham hesaplama gücü ve AI çıkarım hızı karşılaştırması (metriklerle).
2. Mimari: Dual-Die tasarımı, transistör yoğunluğu ve NVLink 5.0 gibi yapısal yenilikler.
3. Verimlilik: Güç tüketimi başına performans ve soğutma teknolojileri.
4. Pazar Etkisi: Önümüzdeki 3-5 yıl içinde AI ekonomisi, veri merkezleri ve küresel teknoloji pazarındaki projeksiyonlar.
Dili son derece profesyonel, teknik ve ikna edici bir Türkçede tut. Metrikleri net bir şekilde vurgula. Markdown formatında başlıklarla (##, ###) ve listelerle zenginleştir.`;
      
      const text = await generateAIContent(prompt);
      setDeepAnalysisResult(text);
    } catch (error) {
      console.error("Deep AI Analysis Error:", error);
      setDeepAnalysisResult("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsGeneratingDeep(false);
    }
  };

  const generateB100Analysis = async (aspect: string | null = null) => {
    if (isGeneratingAnalysis) return;
    
    setIsGeneratingAnalysis(true);
    setSelectedAspect(aspect);
    try {
      let prompt = "NVIDIA B100 Blackwell mimarisini H200 ile karşılaştıran teknik bir analiz yap. Şu detayları (208 Milyar Transistör, x30 AI Performansı, HBM3e, Dual-Die) kullanarak 4-5 kısa madde halinde avantajlarını ve 'Gelecek Öngörüsü' başlığı altında pazar etkisini açıkla. Türkçe ve son derece profesyonel/teknik bir dil kullan. Yanıtı JSON formatında şu yapıda ver: { \"comparison\": [\"madde 1\", \"madde 2\", ...], \"futureOutlook\": \"açıklama\" }";
      
      if (aspect === 'TRANSISTOR') {
        prompt = "NVIDIA Blackwell mimarisinin 208 milyar transistörlü yapısı ve Dual-Die verimliliği üzerine derinlemesine teknik bir analiz yap. Bunun veri merkezi yoğunluğu ve enerji verimliliği üzerindeki etkilerini açıkla. Türkçe kullan. Yanıtı JSON formatında şu yapıda ver: { \"comparison\": [\"madde 1\", \"madde 2\", ...], \"futureOutlook\": \"açıklama\" }";
      } else if (aspect === 'PERFORMANCE') {
        prompt = "NVIDIA Blackwell mimarisinin H100'e kıyasla sunduğu x30 AI performans artışı ve RTX Nöral Çıkarım Motoru hakkında derinlemesine teknik analiz yap. İş yükü yönetimi ve maliyet avantajlarını açıkla. Türkçe kullan. Yanıtı JSON formatında şu yapıda ver: { \"comparison\": [\"madde 1\", \"madde 2\", ...], \"futureOutlook\": \"açıklama\" }";
      } else if (aspect === 'MEMORY') {
        prompt = "NVIDIA Blackwell mimarisinin HBM3e süper hızlı belleği (8TB/s bant genişliği) hakkında derinlemesine teknik analiz yap. Büyük Dil Modelleri (LLM) eğitimi ve çıkarımındaki kritik rolünü açıkla. Türkçe kullan. Yanıtı JSON formatında şu yapıda ver: { \"comparison\": [\"madde 1\", \"madde 2\", ...], \"futureOutlook\": \"açıklama\" }";
      } else if (aspect === 'NVLINK') {
        prompt = "NVIDIA Blackwell NVLink 5.0 ve Dual-Die entegrasyonu hakkında derinlemesine teknik analiz yap. Binlerce GPU'nun tek bir sistem gibi çalışmasındaki önemini vurgula. Türkçe kullan. Yanıtı JSON formatında şu yapıda ver: { \"comparison\": [\"madde 1\", \"madde 2\", ...], \"futureOutlook\": \"açıklama\" }";
      }

      const text = await generateAIContent(prompt);
      // Basic JSON extraction if Gemini adds markdown markers
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(jsonStr);
      setAiAnalysis(data);
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const getFilteredData = useCallback(() => {
    switch(activeTab) {
      case 'GÜNCEL':
        return dynamicRevenueData.filter(d => d.value <= 196);
      case '2026 HEDEFİ':
        return dynamicRevenueData;
      case '2027 ANALİZİ':
        return [...dynamicRevenueData, { name: 'Hedef 2027', Blackwell: 300, Omniverse: 120, DataCenter: 65, value: 485.00, note: 'ÜRETKEN AI EKOSİSTEMİ' }];
      default:
        return dynamicRevenueData;
    }
  }, [activeTab]);

  const chartData = getFilteredData();

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="main-container text-white font-sans selection:bg-nvidia selection:text-black pb-safe px-safe overflow-x-hidden pt-[60px] md:pt-[70px]">
      {/* Background Atmosphere */}
      <div className="bg-atmosphere">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(118,185,0,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#76B900]/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#76B900]/3 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[#76B900]/5 blur-[120px] animate-pulse" />
            
            <div className="relative group">
              {/* Massive Outer Glow */}
              <div className="absolute inset-0 bg-nvidia/20 blur-[100px] scale-150 animate-pulse" />
              <div className="absolute inset-0 bg-nvidia/10 blur-[150px] scale-[2.5] opacity-50" />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10"
              >
                <NvidiaLogo 
                  className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-[0_0_50px_#76B900] drop-shadow-[0_0_100px_rgba(118,185,0,0.5)]" 
                  fill="#76B900" 
                />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-12 text-center relative z-10"
            >
              <h1 className="text-2xl font-black tracking-[0.5em] text-white italic drop-shadow-2xl">NVIDIA</h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-nvidia" />
                <span className="text-[10px] font-black text-nvidia uppercase tracking-[0.3em] animate-pulse">STRATEJİK ANALİZ PORTALI</span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-nvidia" />
              </div>
            </motion.div>

            {/* Scanning Line Effect */}
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-nvidia/30 to-transparent z-20 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[2100] bg-black/95 backdrop-blur-2xl p-8 pt-safe pr-safe flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <NvidiaLogo className="w-8 h-8" fill="#76B900" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-nvidia transition-colors z-50 bg-white/5 active:scale-90"
                aria-label="Kapat"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <nav className="flex flex-col gap-8">
              {['Ana Sayfa', 'Pazar Analizi', 'Yol Haritası', 'İletişim'].map((item, i) => {
              const hrefs = ['vision', 'financials', 'roadmap', 'contact'];
              return (
                <a
                  key={hrefs[i]}
                  href={`#${hrefs[i]}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-black uppercase tracking-widest text-white/40 hover:text-nvidia transition-colors"
                >
                  {item}
                </a>
              );
            })}
            </nav>
            <div className="mt-auto pb-12">
               <button 
                onClick={() => window.open('https://investor.nvidia.com', '_blank')}
                className="w-full py-4 bg-nvidia text-black text-xs font-black uppercase tracking-widest"
              >
                Yatırımcı Portalı
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeepAnalysisOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 sm:p-20 pt-safe pb-safe">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeepAnalysisOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="relative w-full max-w-6xl max-h-[85vh] bg-neutral-950 border-2 border-nvidia/30 shadow-[0_0_150px_rgba(118,185,0,0.2)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-[60]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-nvidia/10 border border-nvidia/30">
                    <Sparkles className="w-8 h-8 text-nvidia" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">B100 Blackwell Derin Analiz</h2>
                    <p className="text-[10px] font-black text-nvidia uppercase tracking-[0.4em]">AI Üretimli Stratejik Rapor</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDeepAnalysisOpen(false)}
                  className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-nvidia transition-colors group z-[70] bg-white/5 active:scale-95"
                  aria-label="Kapat"
                >
                  <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(118,185,0,0.05)_0%,transparent_50%)]">
                {isGeneratingDeep ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-nvidia/20 border-t-nvidia rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <NvidiaLogo className="w-10 h-10 animate-pulse text-nvidia" fill="#76B900" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-nvidia text-xs font-black uppercase tracking-[0.5em] animate-pulse">Analiz Motoru Sentezleniyor...</p>
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-loose">
                         Blackwell Mimarisi, NVLink 5.0 ve Pazar Projeksiyonları İşleniyor
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="markdown-body p-4 sm:p-0">
                    <Markdown
                      components={{
                        h2: ({node, ...props}) => <h2 className="text-nvidia text-2xl font-black uppercase tracking-tighter italic mt-12 mb-6 border-b border-nvidia/20 pb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-white text-xl font-black uppercase tracking-tight mt-8 mb-4 border-l-4 border-nvidia pl-4" {...props} />,
                        p: ({node, ...props}) => <p className="text-white/70 text-base leading-relaxed mb-6 font-medium" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-4 mb-8 list-none" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex gap-4 text-white/80 text-sm font-semibold uppercase tracking-tight">
                            <span className="text-nvidia shrink-0 mt-1">▶</span>
                            {props.children}
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="text-nvidia font-black" {...props} />,
                      }}
                    >
                      {deepAnalysisResult}
                    </Markdown>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/60 text-[8px] font-black uppercase tracking-widest text-white/30 italic">
                <span>© 2026 NVIDIA STRATEJİK ANALİZ PORTALI</span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-nvidia rounded-full animate-pulse" />
                  GÜVENLİK DÜZEYİ: ENCRYPTED-L3
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed inset-0 sm:inset-y-0 sm:right-0 h-full w-full sm:w-[500px] md:w-[640px] bg-black border-l border-nvidia/30 z-[1200] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-safe">
                {drawerType === 'SPEC' && selectedSpec && (
                  <div className="p-6 sm:p-10 lg:p-16 space-y-8 sm:space-y-12">
                    <div className="flex justify-between items-start sticky top-0 bg-black/80 backdrop-blur-md z-[60] py-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
                      <div className="p-2 sm:p-3 bg-nvidia/10 border border-nvidia/30">
                        {selectedSpec.icon}
                      </div>
                      <button 
                        onClick={closeDrawer} 
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/40 hover:text-nvidia transition-all bg-white/5 shadow-xl active:scale-90 rounded-full"
                        aria-label="Kapat"
                      >
                        <X className="w-6 h-6 sm:w-8 sm:h-8" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                        {selectedSpec.title}
                      </h2>
                      <p className="text-nvidia text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] border-b border-nvidia/20 pb-4 block">
                        {selectedSpec.subtitle}
                      </p>
                    </div>

                    <div className="space-y-8 sm:space-y-10">
                       <section>
                         <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">MİMARİ DERİNLİK</h4>
                         <p className="text-white/70 text-sm sm:text-base leading-relaxed font-medium bg-white/5 p-4 sm:p-6 border-l-2 border-nvidia">
                           {selectedSpec.content}
                         </p>
                       </section>

                       <section>
                         <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">TEKNİK PARAMETRELER</h4>
                         <div className="space-y-1">
                           {selectedSpec.technicalSpecs.map((spec, i) => (
                             <div key={i} className="flex justify-between items-center py-4 border-b border-white/5">
                               <span className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mr-4">{spec.label}</span>
                               <span className="text-[10px] sm:text-[12px] font-black text-nvidia tracking-tight text-right">{spec.value}</span>
                             </div>
                           ))}
                         </div>
                       </section>

                       <section className="bg-nvidia/5 p-5 sm:p-8 border border-nvidia/20">
                         <h4 className="text-[9px] sm:text-[10px] font-black text-nvidia uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                           <TrendingUp className="w-4 h-4" /> STRATEJİK HEDEF ANALİZİ
                         </h4>
                         <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                           {selectedSpec.strategicImpact}
                         </p>
                       </section>

                       {/* Performance Comparison */}
                       <section className="space-y-4">
                          <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">H100 vs B100 KIYASLAMASI</h4>
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="p-4 sm:p-6 bg-white/5 border border-white/10">
                              <p className="text-[7px] sm:text-[8px] font-black text-white/30 uppercase mb-2">HOPPER H100</p>
                              <p className="text-lg sm:text-2xl font-black text-white/60 italic">
                                {selectedSpec.id === 'TRANSISTOR' ? '80B' : 
                                 selectedSpec.id === 'PERFORMANCE' ? '4 PF' :
                                 selectedSpec.id === 'MEMORY' ? '3.3 TB/s' : '900 GB/s'}
                              </p>
                            </div>
                            <div className="p-4 sm:p-6 bg-nvidia/10 border border-nvidia/30">
                              <p className="text-[7px] sm:text-[8px] font-black text-nvidia uppercase mb-2">BLACKWELL B100</p>
                              <p className="text-lg sm:text-2xl font-black text-white italic">
                                {selectedSpec.id === 'TRANSISTOR' ? '208B' : 
                                 selectedSpec.id === 'PERFORMANCE' ? '20 PF' :
                                 selectedSpec.id === 'MEMORY' ? '8.0 TB/s' : '1.8 TB/s'}
                              </p>
                            </div>
                          </div>
                       </section>
                    </div>
                  </div>
                )}

                {drawerType === 'PROJECT' && selectedProject && (
                  <div className="p-6 sm:p-10 lg:p-16 space-y-8 sm:space-y-12">
                    <div className="flex justify-between items-start sticky top-0 bg-black/80 backdrop-blur-md z-[60] py-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
                      <div className="p-2 sm:p-3 bg-nvidia/10 border border-nvidia/30">
                        {selectedProject.icon}
                      </div>
                      <button 
                        onClick={closeDrawer} 
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/40 hover:text-nvidia transition-all bg-white/5 shadow-xl active:scale-90 rounded-full"
                        aria-label="Kapat"
                      >
                        <X className="w-6 h-6 sm:w-8 sm:h-8" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                        {selectedProject.title}
                      </h2>
                      <div className="h-1.5 w-24 bg-nvidia" />
                    </div>

                    <div className="space-y-8 sm:space-y-10">
                       <section className="space-y-4">
                          <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">PROJE VİZYONU</h4>
                          <p className="text-xl sm:text-2xl md:text-3xl font-black text-nvidia/90 leading-tight uppercase italic tracking-tighter">
                            {selectedProject.desc}
                          </p>
                          <p className="text-white/70 leading-loose text-sm sm:text-base md:text-lg font-medium">
                            {selectedProject.details}
                          </p>
                       </section>

                       <section className="bg-black border border-nvidia/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(118,185,0,0.1)] relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                             <NvidiaLogo className="w-24 h-24 lg:w-32 lg:h-32" fill="#76B900" />
                          </div>
                          <h5 className="text-nvidia text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Sparkles className="w-4 h-4" /> PROJEKSİYON HEDEFİ
                          </h5>
                          <p className="text-xl sm:text-3xl font-black text-white italic tracking-tight leading-snug">
                             {selectedProject.target}
                          </p>
                       </section>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 sm:p-6 border border-white/10 bg-white/5">
                             <span className="text-[8px] sm:text-[10px] font-black text-white/30 block mb-1 uppercase tracking-widest">GÜVENLİK</span>
                             <span className="text-[9px] sm:text-[11px] font-black text-nvidia uppercase whitespace-nowrap">L3 GIZLILIK DERECESI</span>
                          </div>
                          <div className="p-4 sm:p-6 border border-white/10 bg-white/5 text-right">
                             <span className="text-[8px] sm:text-[10px] font-black text-white/30 block mb-1 uppercase tracking-widest">DURUM</span>
                             <span className="text-[9px] sm:text-[11px] font-black text-nvidia animate-pulse uppercase">AKTİF ANALİZ</span>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-white/10 bg-nvidia/5 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-white/30">
                <span>© 2026 NVIDIA STRATEJİK ANALİZ</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-nvidia rounded-full animate-ping" />
                  GÜNCEL VERİ AKIŞI
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {apiError && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[3000] flex items-center gap-3 px-6 py-3 bg-red-950/90 border border-red-500/50 backdrop-blur-xl shadow-[0_0_50px_rgba(255,0,0,0.2)]"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-red-200 uppercase tracking-widest whitespace-nowrap">
              SİSTEM HATASI: {apiError}
            </span>
            <button 
              onClick={() => setApiError(null)}
              className="ml-4 text-red-200/40 hover:text-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 w-full z-[2000] border-b border-nvidia/20 glass backdrop-blur-3xl overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[60px] md:h-[72px]">
          <div className="flex items-center gap-2 sm:gap-4 group pointer-events-auto cursor-pointer active:scale-95 transition-transform shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <NvidiaLogo className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-nvidia" fill="#76B900" />
            <div className="flex flex-col">
              <h1 className="text-[11px] sm:text-xs md:text-sm font-black tracking-tight leading-tight text-white uppercase italic">NVIDIA</h1>
              <span className="text-[5.5px] sm:text-[6.5px] md:text-[7.5px] font-black text-nvidia tracking-[0.2em] sm:tracking-[0.35em] uppercase hidden xs:block">STRATEJİK ANALİZ PORTALI</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 xl:gap-14">
            {[
              { label: 'Vizyon', href: 'vision' },
              { label: 'Finans', href: 'financials' },
              { label: 'Yol Haritası', href: 'roadmap' }
            ].map((item) => (
              <a
                key={item.href}
                href={`#${item.href}`}
                className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50 hover:text-nvidia transition-all active:scale-95 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-8 justify-end shrink-0">
            <div className="flex flex-col items-end mr-1 sm:mr-0">
              <span className="text-[6px] md:text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">NVDA</span>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-nvidia rounded-full animate-pulse shadow-[0_0_5px_#76B900]" />
                <span id="live-price" className="text-xs sm:text-sm md:text-lg lg:text-xl font-black text-white tabular-nums tracking-tighter">
                  ${(stock?.price || 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:text-nvidia transition-all active:scale-90"
              aria-label="Menü"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button 
              onClick={() => window.open('https://investor.nvidia.com', '_blank')}
              className="hidden lg:flex bg-nvidia text-black px-6 py-2.5 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(118,185,0,0.2)] hover:shadow-[0_0_30px_rgba(118,185,0,0.4)]"
            >
              Yatırımcı Portalı
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Stats Bar */}
      <div className="fixed top-[60px] md:top-[72px] left-0 w-full z-[1500] bg-nvidia border-b border-white/20 px-4 py-1.5 overflow-x-auto overflow-y-hidden scroll-hide shadow-[0_5px_40px_rgba(118,185,0,0.4)]">
        <div className="max-w-7xl mx-auto flex flex-nowrap items-center justify-start lg:justify-between gap-6 md:gap-10 min-w-max">
           <div className="flex items-center gap-2 shrink-0">
             <span className="text-[8px] sm:text-[9px] font-black text-black/60 uppercase tracking-widest whitespace-nowrap italic">SOVEREIGN AI ETKİSİ:</span>
             <span className="text-[10px] sm:text-[11px] font-black text-black italic tracking-tighter uppercase whitespace-nowrap">+%15 TALEB ARTIŞI</span>
           </div>
           <div className="hidden sm:block h-3 w-[1px] bg-black/20 shrink-0" />
           <div className="flex items-center gap-2 shrink-0">
             <span className="text-[8px] sm:text-[9px] font-black text-black/60 uppercase tracking-widest">MCAP:</span>
             <span className="text-[10px] sm:text-[11px] font-black text-black italic tracking-tighter numeric-glow">{stock.marketCap}</span>
           </div>
           <div className="hidden sm:block h-3 w-[1px] bg-black/20 shrink-0" />
           <div className="flex items-center gap-2 shrink-0">
             <span className="text-[8px] sm:text-[9px] font-black text-black/60 uppercase tracking-widest">2026 HEDEF:</span>
             <span className="text-[10px] sm:text-[11px] font-black text-black italic tracking-tighter numeric-glow">${(projectedTarget || 0).toFixed(2)}</span>
           </div>
           <div className="hidden lg:block h-4 w-[1px] bg-black/20 shrink-0" />
           <div className="flex items-center gap-2 bg-black px-3 py-1 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.3)] group hover:scale-105 transition-transform cursor-default shrink-0">
             <Sparkles className="w-3 h-3 text-[#76B900] animate-pulse" />
             <span className="text-[9px] sm:text-[10px] font-black text-[#76B900] uppercase tracking-widest whitespace-nowrap">
               POTANSİYEL: <span className="text-white">+%{((projectedTarget / (stock?.price || 1) - 1) * 100).toFixed(1)}</span>
             </span>
           </div>
        </div>
      </div>

      <main id="top" className="relative z-10 pt-[50px] md:pt-[60px]">
        <section className="relative h-[80dvh] md:h-screen w-full overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <img 
                src={HERO_SLIDES[currentSlide].image} 
                alt={HERO_SLIDES[currentSlide].title}
                className="w-full h-full object-cover grayscale opacity-40 scale-105"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
             <div className="flex flex-col gap-6 md:gap-8 max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={`title-${currentSlide}`}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-12 bg-nvidia" />
                    <span className="text-[10px] md:text-xs font-black text-nvidia uppercase tracking-[0.4em]">{HERO_SLIDES[currentSlide].tag}</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85] py-2">
                    {HERO_SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-white/60 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl">
                    {HERO_SLIDES[currentSlide].desc}
                  </p>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="flex flex-wrap gap-4 mt-4"
                >
                  <button 
                    onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 md:px-10 py-3 md:py-4 bg-nvidia text-black text-[10px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all hover:brightness-110 shadow-[0_0_40px_rgba(118,185,0,0.3)]"
                  >
                    VİZYONU KEŞFET
                  </button>
                  <button 
                    onClick={generateDeepB100Analysis}
                    className="px-8 md:px-10 py-3 md:py-4 bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-white/10"
                  >
                    TEKNİK ANALİZ
                  </button>
                </motion.div>

                <div className="flex gap-2 mt-8 md:mt-12">
                   {HERO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1 transition-all duration-500 ${i === currentSlide ? 'w-12 bg-nvidia' : 'w-6 bg-white/20'}`}
                        aria-label={`Slayt ${i + 1}`}
                      />
                   ))}
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-30" />
        </section>

        <div id="vision" className="w-full relative py-12 md:py-24 bg-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
               <motion.div
                 whileInView={{ opacity: 1, y: 0 }}
                 initial={{ opacity: 0, y: 30 }}
                 viewport={{ once: true }}
                 className="lg:col-span-8 flex flex-col gap-10 md:gap-16"
               >
                 <div className="space-y-4">
                    <span className="text-[10px] md:text-xs font-black text-nvidia uppercase tracking-[0.4em]">GELECEĞİN MİMARİSİ</span>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                      BLACKWELL: <br />
                      <span className="text-nvidia">YENİ ÇAĞIN</span> BAŞLANGICI
                    </h2>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                    <TechPanel 
                      title="TEKNİK ÜSTÜNLÜK" 
                      titleTooltip="Mimari Verimlilik ve Performans"
                      className="group min-h-[400px]"
                    >
                      <div className="flex flex-col h-full space-y-6">
                        <div className="flex flex-wrap gap-2">
                           {TECH_SPECS.map((spec) => (
                             <button
                                key={spec.id}
                                onClick={() => openDrawer('SPEC', spec)}
                                className="px-3 py-1.5 border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:border-nvidia transition-all whitespace-nowrap"
                             >
                               {spec.title}
                             </button>
                           ))}
                        </div>
                        <div className="flex-grow min-h-[220px] md:min-h-[280px] pt-4">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart 
                               data={TECHNICAL_COMPARISON_DATA}
                               margin={{ right: 5, left: -20, top: 10, bottom: 0 }}
                             >
                             <defs>
                                <linearGradient id="colorB100" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#76B900" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#76B900" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis dataKey="x" hide />
                             <YAxis hide domain={[0, 450]} />
                             <Tooltip 
                               content={<CustomTooltip />} 
                               cursor={{ stroke: '#76B900', strokeWidth: 1, strokeDasharray: '4 4' }}
                             />
                             <Area type="monotone" dataKey="h100" stroke="#ffffff20" fill="transparent" strokeWidth={2} />
                             <Area type="monotone" dataKey="h200" stroke="#76B90040" fill="transparent" strokeWidth={2} />
                             <Area type="monotone" dataKey="b100" stroke="#76B900" fill="url(#colorB100)" strokeWidth={3} animationDuration={2000} />
                             </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-white/30 uppercase tracking-widest pt-4 border-t border-white/5">
                           <span>H100 / H200 NESİLLERİ</span>
                           <span className="text-nvidia">BLACKWELL PROJEKSİYONU</span>
                        </div>
                      </div>
                    </TechPanel>

                    <TechPanel title="AI FABRİKALARI" titleTooltip="Genişletilebilir Veri Merkezi Çözümleri" className="min-h-[400px]">
                       <div className="flex flex-col h-full justify-between gap-6">
                          <div className="space-y-4">
                            <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-medium">
                              NVIDIA Blackwell, sadece bir çip değil, modern AI fabrikalarının temel taşıdır. NVLink 5.0 ile 576 GPU'yu tek bir sistem gibi çalıştıran bu mimari, enerji tüketimini %25 azaltırken çıkarım hızını 30 kat artırır.
                            </p>
                            <div className="space-y-4 pt-4">
                               {[
                                 { label: 'GÜÇ VERİMLİLİĞİ', val: '25x', color: '#76B900' },
                                 { label: 'AI PARAMETRE KAPASİTESİ', val: '27T', color: '#ffffff' }
                               ].map((item, i) => (
                                 <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <span className="text-[9px] font-black text-white/30 tracking-widest">{item.label}</span>
                                    <span className="text-2xl font-black italic tracking-tighter" style={{ color: item.color }}>{item.val}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                          <button 
                            onClick={generateDeepB100Analysis}
                            className="w-full py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:border-nvidia hover:text-nvidia transition-all group/btn flex items-center justify-center gap-2"
                          >
                            DOKÜMANTASYONA GİT
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                       </div>
                    </TechPanel>
                 </div>
               </motion.div>

               <motion.div
                 whileInView={{ opacity: 1, x: 0 }}
                 initial={{ opacity: 0, x: 30 }}
                 viewport={{ once: true }}
                 className="lg:col-span-4 flex flex-col gap-8"
               >
                 <div className="glass-panel p-8 md:p-10 min-h-[400px] lg:h-full relative overflow-hidden group border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <NvidiaLogo className="w-24 h-24 lg:w-32 lg:h-32" fill="#76B900" />
                    </div>
                    <div className="relative z-10 space-y-10 lg:h-full flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-nvidia uppercase tracking-[0.2em]">GELECEK ÖNGÖRÜSÜ</span>
                          <h4 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">STRATEJİK KONUMLANMA</h4>
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-medium">
                          Blackwell mimarisi, Trilyon-Parametreli Büyük Dil Modelleri (LLM) için özel olarak tasarlandı. Bu mimari, NVIDIA'nın pazar payını %90 üzerinde tutmasının anahtarıdır.
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-white/5 p-5 md:p-6 border border-white/10 group-hover:border-nvidia transition-all">
                           <div>
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">PROJE HEDEFİ</p>
                             <p className="text-base font-black text-white uppercase italic">RUBIN MİMARİSİ</p>
                           </div>
                           <TrendingUp className="w-8 h-8 text-nvidia" />
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-5 md:p-6 border border-white/10 group-hover:border-nvidia transition-all">
                           <div>
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">HAZIRLIK EVRESİ</p>
                             <p className="text-base font-black text-white uppercase italic">HBM4 ENTEGRASYONU</p>
                           </div>
                           <Activity className="w-8 h-8 text-white/20" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-[9px] font-black text-white/40 italic">STRATEGIC UPDATE: 2026.05</span>
                        <NvidiaLogo className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity" fill="#76B900" />
                      </div>
                    </div>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>

        <div id="financials" className="w-full relative py-12 md:py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
               {/* 1. INVESTOR SIMULATION TOOL */}
               <div className="lg:col-span-5 flex flex-col gap-8">
                  <TechPanel 
                    title="SİMÜLASYON ARACI" 
                    titleTooltip="Pazar Payı ve AI Adaptasyon Senaryoları"
                    className="bg-nvidia/5 border-nvidia/20 lg:h-full"
                  >
                    <div className="space-y-8 py-2">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-5 bg-black/60 border border-nvidia/20 shadow-xl">
                        <div className="text-center sm:text-left">
                          <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">PROJEKTE EDİLEN FİYAT (2026)</p>
                          <p className="text-4xl md:text-5xl font-black text-nvidia tracking-tighter numeric-glow">${(simTargetPrice || 0).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center sm:items-end gap-2">
                           <span className="text-[8px] font-black text-nvidia uppercase tracking-widest bg-nvidia/10 px-3 py-1 border border-nvidia/20">SENARYO: AKTİF</span>
                           <span className="text-[10px] font-black text-white/30 italic">VARYANS: ±%4.2</span>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">PAZAR DOMİNASYONU</span>
                            <span className="text-nvidia font-black text-xs md:text-sm">%{(simMarketShare || 0).toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" min="70" max="98" step="0.1"
                            value={simMarketShare}
                            onChange={(e) => setSimMarketShare(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 accent-nvidia rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">AI FABRİKASI ADAPTASYONU</span>
                            <span className="text-nvidia font-black text-xs md:text-sm">%{(simAiAdoption || 0).toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" min="50" max="100" step="0.1"
                            value={simAiAdoption}
                            onChange={(e) => setSimAiAdoption(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 accent-nvidia rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                         <div className="flex items-center gap-3 text-white/40 mb-4">
                           <Info className="w-4 h-4" />
                           <p className="text-[10px] font-medium leading-relaxed uppercase">
                             Bu simülasyon, NVIDIA Blackwell mimarisinin kurumsal adaptasyon hızını ve HBM4 bellek tedarik zinciri stabilitesini baz almaktadır.
                           </p>
                         </div>
                      </div>
                    </div>
                  </TechPanel>

                  <TechPanel title="Ç4 FİNANSAL HEDEFLER" className="group">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                       <div className="p-4 bg-white/5 border-l-2 border-nvidia">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">HEDEF GELİR</span>
                          <span className="text-3xl font-black text-white tracking-tighter italic leading-none">$26.0B</span>
                          <span className="text-nvidia text-[9px] font-black block mt-2 text-right">+%265 YoY</span>
                       </div>
                       <div className="p-4 bg-white/5 border-l-2 border-white/20">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">MARJ TAHMİNİ</span>
                          <span className="text-3xl font-black text-white tracking-tighter italic leading-none">%76.5</span>
                          <span className="text-white/40 text-[9px] font-black block mt-2 text-right">OPTIMAL</span>
                       </div>
                    </div>
                    <div className="h-44">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={SECTOR_DATA}>
                            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                               {SECTOR_DATA.map((entry, i) => (
                                 <Cell key={`cell-${i}`} fill={i === 3 ? '#76B900' : '#ffffff20'} />
                               ))}
                            </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-4 text-[8px] font-black text-white/30 uppercase tracking-widest border-t border-white/5 pt-4">
                       <span>Ç1</span>
                       <span>Ç2</span>
                       <span>Ç3</span>
                       <span className="text-nvidia">Ç4 EST.</span>
                    </div>
                  </TechPanel>
                </div>
             </div>

          {/* Bottom Row */}

          {/* Bottom Row */}
          <div className="lg:col-span-12 grid grid-cols-1 gap-8 pt-4">
            
            {/* Real-time Financials Selector */}
            <div className="w-full">
              <TechPanel title="2026 PİYASA PROJEKSİYON MATRİSİ" className="relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 mb-8 overflow-x-auto pb-2 sm:pb-0 scroll-hide">
                  <div className="flex gap-2">
                    {['2026 HEDEFİ', '2027 ANALİZİ'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 whitespace-nowrap ${
                          activeTab === tab ? 'bg-nvidia text-black border-nvidia shadow-[0_0_20px_rgba(118,185,0,0.4)]' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="sm:ml-auto px-4 py-2.5 bg-nvidia/10 text-nvidia border border-nvidia/30 text-[8px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 bg-nvidia rounded-full animate-pulse" />
                    STRATEJİK VERİ AKIŞI: AKTİF
                  </div>
                </div>

                <div className="h-[300px] md:h-[400px] relative">
                   <div className="absolute top-0 right-0 z-10 px-3 py-1.5 bg-nvidia border border-white/20 text-[9px] font-black text-black uppercase tracking-wider italic animate-bounce shadow-xl hidden sm:block">
                     BLACKWELL ETKİSİ: POZİTİF
                   </div>
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorBlackwell" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#76B900" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#76B900" stopOpacity={0}/>
                           </linearGradient>
                           <linearGradient id="colorDataCenter" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0080FF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0080FF" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="1 10" stroke="#ffffff10" vertical={false} />
                         <XAxis 
                           dataKey="name" 
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: '#ffffff20', fontSize: 9, fontWeight: 900 }}
                           dy={10}
                         />
                         <YAxis hide domain={['auto', 'auto']} />
                         <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#76B900', strokeWidth: 1 }} />
                         <Area 
                           type="monotone" 
                           dataKey="Blackwell" 
                           stroke="#76B900" 
                           fill="url(#colorBlackwell)" 
                           strokeWidth={3} 
                           animationDuration={2000}
                         />
                         <Area 
                           type="monotone" 
                           dataKey="DataCenter" 
                           stroke="#0080FF" 
                           fill="url(#colorDataCenter)" 
                           strokeWidth={2} 
                           strokeDasharray="5 5"
                           animationDuration={2000}
                         />
                       </AreaChart>
                   </ResponsiveContainer>
                </div>
              </TechPanel>
            </div>
          </div>
        </div>
      </div>

        <div id="roadmap" className="w-full relative py-12 md:py-24 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
               <div className="lg:col-span-2">
                 <TechPanel 
                   title="B100 BLACKWELL DERİN ANALİZ" 
                   titleTooltip="Blackwell mimarisi ve gelecek pazar etkisi"
                   className="group relative overflow-hidden bg-black/40 lg:h-full min-h-[400px]"
                   action={
                     <button 
                       onClick={generateDeepB100Analysis}
                       className="flex items-center gap-2 px-4 py-2.5 bg-nvidia/10 border border-nvidia/30 text-nvidia text-[9px] font-black uppercase tracking-widest hover:bg-nvidia hover:text-black transition-all active:scale-95"
                     >
                       <BookOpen className="w-4 h-4" /> DERİN ANALİZ
                     </button>
                   }
                 >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-6">
                      <div className="flex flex-col justify-center space-y-10">
                        <div className="space-y-6">
                           <div onClick={() => openDrawer('SPEC', TECH_SPECS[0])} className="cursor-pointer">
                              <SpecCallout label="208 MİLYAR TRANSİSTÖR" sub="DUAL-DIE VERİMLİLİK" icon={<Layers className="w-6 h-6" />} />
                           </div>
                           <div onClick={() => openDrawer('SPEC', TECH_SPECS[1])} className="cursor-pointer">
                              <SpecCallout label="X30 PERFORMANS ARTIŞI" sub="AI ÇIKARIM GÜCÜ" icon={<Zap className="w-6 h-6" />} />
                           </div>
                        </div>

                        <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 group-hover:border-nvidia transition-all">
                           <div className="w-12 h-12 bg-black border border-nvidia/30 flex items-center justify-center p-2 shrink-0">
                             <NvidiaLogo fill="#76B900" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-nvidia uppercase tracking-[0.2em] mb-1">STRATEJİK HEDEF</p>
                              <p className="text-lg font-black text-white italic tracking-tighter uppercase leading-none"> BLACKWELL CORE 2026 </p>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center relative py-12">
                         <div className="absolute inset-0 bg-nvidia/5 blur-[100px] rounded-full animate-pulse" />
                         <div 
                           onClick={() => generateB100Analysis()}
                           className="relative z-10 w-48 h-48 md:w-56 md:h-56 bg-black border border-nvidia/30 p-10 flex flex-col items-center justify-center group/b100 cursor-pointer hover:border-nvidia hover:shadow-[0_0_50px_rgba(118,185,0,0.3)] transition-all active:scale-95"
                         >
                            <div className="absolute inset-0 opacity-0 group-hover/b100:opacity-10 transition-opacity pointer-events-none">
                               <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#76B900 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                            </div>
                            <NvidiaLogo className="w-12 h-12 md:w-16 md:h-16 mb-4" fill="#76B900" />
                            <h4 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter mb-1">B100</h4>
                            <p className="text-[10px] font-black text-nvidia tracking-[0.4em] uppercase">BLACKWELL</p>
                         </div>
                      </div>
                   </div>
                 </TechPanel>
               </div>

               <div className="lg:col-span-1 flex flex-col gap-8">
                  <TechPanel title="PİYASA DOMİNASYONU" className="p-4 md:p-8">
                    <div className="space-y-4 md:space-y-6">
                      {[
                        { id: 'dc', label: 'Veri Merkezi Payı', value: 87.4 },
                        { id: 'hpc', label: 'HPC Gücü', value: 85.0 },
                        { id: 'net', label: 'Ağ Teknolojileri', value: 42.1 },
                        { id: 'as', label: 'Otonom Sistemler', value: 38.5 },
                      ].map((item, idx) => (
                        <div key={item.id} className="space-y-1.5 md:space-y-2">
                           <div className="flex justify-between items-end">
                             <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest truncate">{item.label}</span>
                             <span className="text-lg md:text-xl font-black text-white tracking-tighter">%{item.value}</span>
                           </div>
                           <div className="w-full bg-white/5 h-1">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.value}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-nvidia"
                              />
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <button 
                          onClick={() => window.open('https://investor.nvidia.com', '_blank')}
                          className="w-full py-4 bg-nvidia text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl font-bold"
                        >
                          TAM ANALİZ RAPORU
                        </button>
                    </div>
                  </TechPanel>
               </div>
            </div>
          </div>
        </div>

          {/* 2026 Vizyonu ve Stratejik Projeler Section */}
        <section className="mt-20 lg:mt-32">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic heading-nvidia">
              2026 <span className="text-nvidia">Vizyonu</span> <br className="lg:hidden" />
              <span className="text-white/20 ml-4">& Stratejik Projeler</span>
            </h2>
            <div className="flex-grow h-[1px] bg-gradient-to-r from-nvidia/40 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {PROJECTS.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openDrawer('PROJECT', item)}
                className={`glass-card p-6 md:p-10 group relative overflow-hidden bg-gradient-to-b ${item.bg} cursor-pointer min-h-[280px] flex flex-col justify-between`}
              >
                <div className="absolute top-0 right-0 p-4 md:p-6 opacity-30 group-hover:opacity-100 transition-all text-nvidia relative group/icon">
                  <div className="group-hover/icon:rotate-12 transition-transform duration-300">
                    {item.icon}
                  </div>
                </div>
                <div className="relative z-10 flex-1 flex flex-col justify-end">
                  <motion.h3 
                    layoutId={`title-${item.title}`}
                    className="text-lg md:text-xl font-black text-white group-hover:text-nvidia transition-colors mb-3 md:mb-6 uppercase tracking-tighter leading-none"
                  >
                    {item.title}
                  </motion.h3>
                  <p className="text-white/40 text-[10px] md:text-xs leading-relaxed font-medium mb-4 md:mb-8 line-clamp-3">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-2 text-nvidia text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                    DETAY <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer / Watermark */}
      <footer className="p-8 lg:p-12 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <NvidiaLogo className="w-8 h-8 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" fill="#76B900" />
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/60 italic">NVIDIA: Geleceğin Gücü</p>
            </div>
            <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.2em] max-w-sm">
              Bu platform Blackwell mimarisi ve AI fabrikaları üzerine kurgulanmış profesyonel bir yatırımcı analiz aracıdır.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <span className="text-[10px] font-black text-[#76B900] uppercase tracking-widest">BÜLTENE KAYDOL (YATIRIMCI ANALİZLERİ)</span>
            <div className="flex w-full md:w-[400px]">
              <input 
                type="email" 
                placeholder="E-POSTA ADRESİNİZ..." 
                className="flex-grow bg-white/5 border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-[#76B900]/50 transition-all"
              />
              <button className="px-8 py-3 bg-[#76B900] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                GÖNDER
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">© 2026 NVIDIA STRATEJİK ANALİZ PORTALI - TÜM HAKLARI SAKLIDIR</p>
          <div className="flex gap-8">
            <a href="#contact" className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">Kullanım Koşulları</a>
            <a href="#contact" className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">Gizlilik Politikası</a>
            <a href="#contact" className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">Yatırımcı İlişkileri</a>
          </div>
        </div>
      </footer>

      {/* News Ticker */}
      <div className="fixed bottom-0 left-0 w-full bg-black/95 border-t border-nvidia/30 z-[100] h-10 backdrop-blur-xl flex items-center overflow-hidden pointer-events-auto">
        <div className="flex items-center gap-4 px-6 border-r border-nvidia/30 h-full bg-nvidia/5">
          <div className="w-2 h-2 bg-nvidia rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-nvidia tracking-widest whitespace-nowrap uppercase">SON DAKİKA:</span>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="ticker pl-8 gap-16">
            {NEWS_FEED.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-[8px] font-black px-2 py-0.5 bg-nvidia/10 text-nvidia border border-nvidia/30 uppercase">{item.category}</span>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{item.text}</span>
              </div>
            ))}
            {/* Repeat for seamless loop */}
            {NEWS_FEED.map(item => (
              <div key={`${item.id}-dup`} className="flex items-center gap-3">
                <span className="text-[8px] font-black px-2 py-0.5 bg-nvidia/10 text-nvidia border border-nvidia/30 uppercase">{item.category}</span>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
