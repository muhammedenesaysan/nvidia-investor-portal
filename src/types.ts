import React from 'react';

export interface StockData {
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  high: number;
  low: number;
  lastUpdated: string;
  marketCap: string;
  isDelayed?: boolean;
}

export interface ProjectDetail {
  title: string;
  icon: React.ReactNode;
  desc: string;
  details: string;
  target: string;
  bg: string;
}

export interface TechSpecDetail {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  metric: string;
  icon: React.ReactNode;
  content: string;
  strategicImpact: string;
  technicalSpecs: { label: string; value: string }[];
}

export interface NewsItem {
  id: number;
  text: string;
  category: 'PAZAR' | 'TEKNOLOJİ' | 'FİNANS';
}

export interface HeroSlide {
  id: number;
  title: string;
  tag: string;
  desc: string;
  image: string;
}
