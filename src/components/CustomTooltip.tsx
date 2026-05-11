import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isComparison = 'h100' in data || 'b100' in data;
    
    return (
      <div className="bg-black/95 border border-nvidia/50 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-nvidia/20">
        <div className="flex justify-between items-center mb-2 gap-4">
          <p className="text-[10px] font-black tracking-widest text-white/50 uppercase">{label || (isComparison ? 'Nesil Karşılaştırma' : '')}</p>
          {data.isLive && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-nvidia/10 border border-nvidia/30">
              <div className="w-1.5 h-1.5 bg-nvidia rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-nvidia uppercase tracking-widest">CANLI</span>
            </div>
          )}
        </div>
        
        {isComparison ? (
          <div className="space-y-2 mb-2">
            {data.b100 !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-nvidia/60 uppercase tracking-widest">Blackwell B100:</span>
                <p className="text-lg font-black text-nvidia">%{data.b100}</p>
              </div>
            )}
            {data.h200 !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">H200 Hopper:</span>
                <p className="text-lg font-black text-white/70">%{data.h200}</p>
              </div>
            )}
            {data.h100 !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">H100 Hopper:</span>
                <p className="text-lg font-black text-white/40">%{data.h100}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Piyasa Değeri:</span>
            <p className="text-2xl font-black text-nvidia tracking-tighter drop-shadow-[0_0_10px_rgba(118,185,0,0.5)]">${(data.value || 0).toFixed(2)}</p>
          </div>
        )}
        <div className="pt-2 border-t border-white/10">
          <p className="text-[9px] font-bold text-nvidia/80 uppercase tracking-widest leading-relaxed">
            ANALİZ: {data.note || "VERİ AKIŞI AKTİF"}
          </p>
        </div>
      </div>
    );
  }
  return null;
};
