import React from 'react';
import { Layers, Zap, Box, Activity, Globe, Cpu, Sparkles } from 'lucide-react';
import { TechSpecDetail, ProjectDetail, HeroSlide, NewsItem, StockData } from './types';

export const TECH_SPECS: TechSpecDetail[] = [
  {
    id: 'TRANSISTOR',
    title: '208 MİLYAR TRANSİSTÖR',
    subtitle: 'Ultra Verimli Dual-Die Paketleme',
    value: '208B',
    metric: 'Transistör Yoğunluğu',
    icon: <Layers className="w-10 h-10 text-nvidia" />,
    content: 'Blackwell GPU, TSMC 4NP özel üretim süreci ile üretilen 208 milyar transistör içerir. İki tam boyutlu die (zar), saniyede 10 terabayt (TB/s) hızında bir die-to-die bağlantısıyla birleştirilir.',
    strategicImpact: 'Yeni RAS Engine ile veri merkezlerinde sıfır kesinti teknolojisi sağlar.',
    technicalSpecs: [
      { label: 'Üretim Süreci', value: 'TSMC 4NP Custom' },
      { label: 'Die-to-Die Bant Genişliği', value: '10 TB/s' },
      { label: 'Güvenilirlik', value: 'RAS Engine Integrated' },
      { label: 'Paketleme Teknolojisi', value: 'CoWoS-L Ultra' }
    ]
  },
  {
    id: 'PERFORMANCE',
    title: 'X30 PERFORMANS ARTIŞI',
    subtitle: 'RTX Nöral Çıkarım Motoru',
    value: '30X',
    metric: 'AI Çıkarım Gücü',
    icon: <Zap className="w-10 h-10 text-nvidia" />,
    content: 'İkinci Nesil Transformer Motoru ile Blackwell, H100 mimarisine kıyasla LLM çıkarımında 30 kata kadar performans artışı sağlar.',
    strategicImpact: 'AI ekonomisini ve Sovereign AI trendlerini kökten değiştirir.',
    technicalSpecs: [
      { label: 'FP4 Verimliliği', value: '%25 Daha Az Enerji' },
      { label: 'Hassasiyet Desteği', value: 'FP4 (Ultra-High Speed)' },
      { label: 'Tensör Çekirdekleri', value: '5. Nesil Blackwell' }
    ]
  },
  {
    id: 'MEMORY',
    title: 'HBM3E SÜPER BELLEK',
    subtitle: '8TB/S Veri Aktarım Kapasitesi',
    value: '192GB',
    metric: 'Bellek Bant Genişliği',
    icon: <Box className="w-10 h-10 text-nvidia" />,
    content: 'Dünyanın en hızlı HBM3e belleği ile Blackwell, saniyede 8 terabayt veri aktarımı sağlar.',
    strategicImpact: 'AI eğitim süreçlerini haftalardan günlere indirir.',
    technicalSpecs: [
      { label: 'Bellek Türü', value: 'HBM3e' },
      { label: 'Kapasite', value: '192GB' },
      { label: 'Bellek Arayüzü', value: '8192-bit' }
    ]
  },
  {
    id: 'NVLINK',
    title: 'BAĞLANTI HIZI: 1.8TB/S',
    subtitle: 'NVLink 5.0 Kesintisiz Bağlantı',
    value: '1.8TB/s',
    metric: 'Çipler Arası İletişim',
    icon: <Activity className="w-10 h-10 text-nvidia" />,
    content: 'Beşinci nesil NVLink teknolojisi, GPU başı 1.8 TB/s çift yönlü throughput sunar.',
    strategicImpact: 'Binlerce GPU\'nun tek çip gibi çalışmasını sağlar.',
    technicalSpecs: [
      { label: 'NVLink 5.0 Bant Genişliği', value: '1.8 TB/s' },
      { label: 'Maksimum Ölçekleme', value: '576 GPU Koherent Küme' }
    ]
  }
];

export const PROJECTS: ProjectDetail[] = [
  {
    title: "Blackwell Mimari Devrimi",
    icon: <Zap className="w-8 h-8 text-nvidia" />,
    desc: "208 Milyar Transistörlü Dual-Die mimarisi ile AI fabrikalarının kalbi.",
    details: "NVIDIA Blackwell mimarisi, 208 Milyar Transistör ve Dual-Die mimarisiyle trilyon parametreli üretken yapay zeka modelleri için dünyanın en güçlü çipini temsil ediyor.",
    target: "Stratejik Hedef: Küresel AI Altyapı Hakimiyeti",
    bg: "from-[#76B900]/10 to-transparent"
  },
  {
    title: "Omniverse Dijital İkizler",
    icon: <Globe className="w-8 h-8 text-nvidia" />,
    desc: "Fiziksel dünyanın tam dijital ikizi ve endüstriyel meta-evren liderliği.",
    details: "NVIDIA Omniverse, fiziksel dünyayı milimetrik hassasiyetle dijital ortama aktaran, dünyanın en gelişmiş endüstriyel simülasyon platformudur.",
    target: "Stratejik Hedef: Endüstri 5.0 Dijital Dönüşümü",
    bg: "from-[#76B900]/10 to-transparent"
  },
  {
    title: "Isaac Robotik Platformu",
    icon: <Cpu className="w-8 h-8 text-nvidia" />,
    desc: "Otonom robotların yapay zeka ile biyolojik düzeyde öğrenme süreci.",
    details: "Isaac Robotik ekosistemi, yapay zekanın fiziksel dünyaya adaptasyonunu sağlayan uçtan uca bir geliştirme platformudur.",
    target: "Stratejik Hedef: Otonom Robotik ve Lojistik Liderliği",
    bg: "from-[#76B900]/10 to-transparent"
  },
  {
    title: "Rubin Mimari Vizyonu",
    icon: <Sparkles className="w-8 h-8 text-nvidia" />,
    desc: "2027 Projeksiyonu: HBM4 Entegrasyonu ve Yeni Nesil Rubin Mimarisi.",
    details: "NVIDIA Rubin mimarisi, yapay zeka hesaplama gücünde bir sonraki kuantum sıçramasını temsil ediyor.",
    target: "Stratejik Hedef: 2027 Kuantum AI Liderliği",
    bg: "from-[#76B900]/10 to-transparent"
  }
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "NVIDIA: GELECEĞİN GÜCÜ",
    tag: "BLACKWELL MİMARİSİ",
    desc: "208 Milyar Transistörlü Dual-Die mimarisi ile AI fabrikalarının kalbi. Trilyon parametreli modeller için dünyanın en güçlü çipi.",
    image: "https://images.unsplash.com/photo-1591405351990-4726e33df58d?auto=format&fit=crop&q=80&w=2070"
  },
  {
    id: 2,
    title: "DLSS 4.5: NÖRAL SÜPER ÖRNEKLEME",
    tag: "GEFORCE RTX 50 SERİSİ",
    desc: "Dinamik 6X Kare Oluşturma ve 8K Oyunculuğun Zirvesi. Nöral renderlama ile fotorealistik görüntüler.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070"
  },
  {
    id: 3,
    title: "OMNIVERSE: DİJİTAL İKİZLER",
    tag: "ENDÜSTRİYEL METAVERSE",
    desc: "Endüstriyel Meta-evren ve Fiziksel Yapay Zeka. Isaac robotik ekosistemi ile otonom üretim hatları.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2070"
  }
];

export const NEWS_FEED: NewsItem[] = [
  { id: 1, text: "SON DAKİKA: Amazon, Blackwell B100 siparişlerini %50 artırarak AI altyapısında liderliği hedefliyor.", category: 'PAZAR' },
  { id: 2, text: "TEKNOLOJİ: Rubin mimarisi HBM4 entegrasyonu ile 2027 için pazar standartlarını belirliyor.", category: 'TEKNOLOJİ' },
  { id: 3, text: "FİNANS: Goldman Sachs, NVIDIA hedef fiyatını Sovereign AI etkisiyle $400 bandına revize etti.", category: 'FİNANS' },
  { id: 4, text: "PAZAR: Japonya ve İngiltere, Sovereign AI kapasitesi için NVIDIA ile 10 milyar dolarlık yeni anlaşma imzaladı.", category: 'PAZAR' },
  { id: 5, text: "TEKNOLOJİ: Isaac platformu, insansı robot kitle üretiminde %40 verimlilik artışı sağladı.", category: 'TEKNOLOJİ' }
];

export const INITIAL_NVDA: StockData = {
  price: 215.20,
  change: 3.70,
  changePercent: 1.75,
  volume: '136.4M',
  high: 217.80,
  low: 212.89,
  lastUpdated: "11 Mayıs 2026, 02:40",
  marketCap: "5.32T"
};
