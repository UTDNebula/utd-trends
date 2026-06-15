type CardVariant = 'flat' | 'interactive' | 'transparent';

type BaseCardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
};

const baseClasses = 'rounded-lg';

const variantClasses: Record<CardVariant, string> = {
  flat: 'shadow-sm dark:shadow-md',
  interactive:
    'shadow-lg dark:shadow-lg transition-all hover:shadow-xl dark:hover:shadow-2xl',
  transparent: '',
};

export default function BaseCard({
  children,
  variant = 'flat',
  className = '',
  style,
  id,
}: BaseCardProps) {
  const hasBgClass = className.includes('bg-');
  return (
    <div
      {...(id ? { id } : {})}
      style={style}
      className={`${baseClasses} ${hasBgClass || variant === 'transparent' ? '' : 'bg-white dark:bg-neutral-800'} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
