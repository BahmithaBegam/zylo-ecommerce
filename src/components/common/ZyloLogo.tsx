import React from 'react';

interface ZyloLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ZyloLogo: React.FC<ZyloLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizeMap = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl',
  };

  const textSizeMap = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const currentIconClass = iconSizeMap[size] || iconSizeMap.md;
  const currentTextClass = textSizeMap[size] || textSizeMap.md;

  return (
    <div className={`relative inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/zylo-icon.svg"
        alt="Zylo"
        className={`${currentIconClass} shadow-md shadow-indigo-500/20 object-contain select-none transition-transform`}
      />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`${currentTextClass} font-black tracking-tight text-zinc-900 dark:text-white leading-none`}>
              Zylo
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5 hidden xs:block">
            Smart Shopping
          </span>
        </div>
      )}
    </div>
  );
};
