import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, LucideIcon } from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

// Rating Component with stars, numeric rating and review count
interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
}) => {
  const starSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[11px]' : size === 'md' ? 'text-xs' : 'text-sm';

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.5 rounded-md border border-emerald-200/60">
        <span className={textSize}>{Number(rating).toFixed(1)}</span>
        <Star className={`${starSize} fill-emerald-600 text-emerald-600`} />
      </div>
      {showCount && reviewCount !== undefined && (
        <span className={`text-zinc-500 font-medium ${textSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

// PriceDisplay Component with INR format, original price, discount percentage
interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discount,
  size = 'md',
  showDiscount = true,
}) => {
  const currentSize =
    size === 'sm'
      ? 'text-xs font-bold'
      : size === 'md'
      ? 'text-sm sm:text-base font-extrabold'
      : size === 'lg'
      ? 'text-xl sm:text-2xl font-black'
      : 'text-2xl sm:text-3xl font-black';

  const strikeSize =
    size === 'sm'
      ? 'text-[10px]'
      : size === 'md'
      ? 'text-xs'
      : size === 'lg'
      ? 'text-sm'
      : 'text-base';

  const discountPercent =
    discount ||
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className={`text-zinc-950 tracking-tight ${currentSize}`}>
        {formatINR(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className={`text-zinc-400 line-through font-medium ${strikeSize}`}>
          {formatINR(originalPrice)}
        </span>
      )}
      {showDiscount && discountPercent > 0 && (
        <span className="text-[11px] font-black text-rose-600 uppercase tracking-tight">
          {discountPercent}% OFF
        </span>
      )}
    </div>
  );
};

// Badge Component with curated variants
interface BadgeProps {
  variant?: 'new' | 'bestseller' | 'discount' | 'sale' | 'featured' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const styles: Record<string, string> = {
    new: 'bg-indigo-600 text-white',
    bestseller: 'bg-emerald-600 text-white',
    discount: 'bg-rose-600 text-white',
    sale: 'bg-amber-500 text-white',
    featured: 'bg-violet-600 text-white',
    neutral: 'bg-zinc-800 text-white',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Button Component with consistent padding, typography, hover/tap micro-interactions
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 rounded-2xl',
  };

  const variants = {
    primary: 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm hover:shadow',
    secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow',
    outline: 'border border-zinc-300 hover:border-zinc-900 text-zinc-900 bg-white hover:bg-zinc-50',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    ghost: 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

// Interactive Category Card Component
interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
  subtitle?: string;
  itemCount?: number;
  badge?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  image,
  href,
  subtitle,
  itemCount,
  badge,
}) => {
  return (
    <Link
      to={href}
      className="group relative block rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300"
    >
      <div className="aspect-4/5 w-full overflow-hidden relative">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity" />

        {badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 text-zinc-900 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shadow-sm">
            {badge}
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-xs group-hover:text-indigo-200 transition-colors">
              {name}
            </h3>
            {subtitle && <p className="text-[11px] text-zinc-300 font-medium mt-0.5">{subtitle}</p>}
            {itemCount !== undefined && (
              <p className="text-[10px] text-zinc-300 font-semibold mt-0.5">
                {itemCount}+ Styles
              </p>
            )}
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
