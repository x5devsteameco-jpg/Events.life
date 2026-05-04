import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: { mark: 'w-7 h-7', text: 'text-sm' },
  md: { mark: 'w-8 h-8', text: 'text-base' },
  lg: { mark: 'w-10 h-10', text: 'text-lg' },
};

export function BrandLogo({ className, markClassName, textClassName, size = 'md', showText = true }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn('inline-flex items-center justify-center rounded-xl', sizeMap[size].mark, markClassName)}
        style={{
          background: 'linear-gradient(135deg, #00c4a8 0%, #00e5cc 55%, #12f0d8 100%)',
          boxShadow: '0 0 24px rgba(0,229,204,0.28)',
        }}
        aria-hidden="true"
      >
        <svg width="68%" height="68%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L38 11.5V27L24 34.5L10 27V11.5L24 4Z" stroke="#031016" strokeWidth="3.4" strokeLinejoin="round" />
          <path d="M24 13L31.5 17V25L24 29L16.5 25V17L24 13Z" fill="#031016" />
          <path d="M10 11.5L24 19M38 11.5L24 19M24 34.5V19" stroke="#031016" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showText && (
        <span
          className={cn('font-black gradient-text-static tracking-[0.08em] whitespace-nowrap', sizeMap[size].text, textClassName)}
          style={{ fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)" }}
        >
          Gatewise Events
        </span>
      )}
    </div>
  );
}
