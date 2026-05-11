import React from 'react';

export const SpecCallout = React.memo(({ label, sub, icon, tooltip }: { label: string; sub: string; icon: React.ReactNode; tooltip?: string }) => (
  <div className="bg-black/95 border border-[#76B900]/40 p-4 sm:p-7 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group/spec relative overflow-hidden transition-all duration-500 hover:border-[#76B900] hover:scale-105 active:scale-95 w-full sm:w-[260px]">
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#76B900]/50 to-transparent" />
    <div className="flex items-center gap-4 sm:gap-6 relative z-10">
      <div className="p-3 bg-[#76B900]/10 border border-[#76B900]/30 text-[#76B900] group-hover/spec:bg-[#76B900] group-hover/spec:text-black transition-all duration-500 shadow-[0_0_15px_rgba(118,185,0,0.2)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h5 className="text-[10px] sm:text-[13px] font-black text-white italic tracking-tighter uppercase mb-1 leading-none group-hover/spec:text-[#76B900] transition-colors truncate numeric-glow">{label}</h5>
        <p className="text-[8px] sm:text-[10px] font-black text-[#76B900] uppercase tracking-widest opacity-60 group-hover/spec:opacity-100 truncate">{sub}</p>
      </div>
    </div>
    
    {tooltip && (
      <div className="absolute inset-0 bg-black/90 opacity-0 group-hover/spec:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-20">
        <p className="text-[8px] font-black text-nvidia uppercase tracking-[0.2em] mb-2">TEKNİK DOKÜMANTASYON</p>
        <p className="text-[9px] font-bold text-white/80 leading-tight uppercase tracking-widest">
          {tooltip}
        </p>
      </div>
    )}
    
    <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#76B900]/5 blur-2xl rounded-full" />
  </div>
));
