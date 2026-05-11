import React from 'react';

interface TechPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleTooltip?: string;
  action?: React.ReactNode;
}

export const TechPanel = React.memo(({ children, className = "", title = "", titleTooltip = "", action }: TechPanelProps) => (
  <div className={`glass-card ${className} p-6 flex flex-col h-full relative`}>
    <div className="absolute top-0 left-0 w-full h-full bg-nvidia/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    {title && (
      <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4 gap-4 relative group/title">
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40 leading-[1.6] truncate">{title}</h3>
          {action && <div className="mt-4">{action}</div>}
        </div>
        
        {titleTooltip && (
          <div className="absolute bottom-[110%] left-0 opacity-0 group-hover/title:opacity-100 transition-all duration-300 pointer-events-none z-[100] translate-y-2 group-hover/title:translate-y-0">
            <div className="bg-black/95 border border-[#76B900]/50 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              <p className="text-[8px] text-white/80 font-black uppercase tracking-widest whitespace-nowrap">
                {titleTooltip}
              </p>
            </div>
            <div className="w-2 h-2 bg-black border-r border-b border-[#76B900]/50 rotate-45 mx-2 -mt-1 ml-4" />
          </div>
        )}

        <div className="flex gap-1.5 pt-1 mt-0.5 shrink-0 right-0">
          <div className="w-1 h-1 bg-[#76B900]/30 rounded-full" />
          <div className="w-1 h-1 bg-[#76B900]/60 rounded-full" />
          <div className="w-1 h-1 bg-[#76B900] rounded-full shadow-[0_0_5px_#76B900]" />
        </div>
      </div>
    )}
    <div className="flex-grow">
      {children}
    </div>
  </div>
));
