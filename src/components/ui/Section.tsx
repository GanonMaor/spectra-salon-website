import React from 'react';
import { cn } from '../../lib/utils';
import { CONTAINER, PADDING, GAP } from '../../design/layout';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  // Layout props
  container?: keyof typeof CONTAINER;
  padding?: keyof typeof PADDING;
  gap?: keyof typeof GAP;
  // Content props
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  // Visual props
  background?: string;
  id?: string;
}

export function Section({
  children,
  className,
  container = 'default',
  padding = 'lg',
  gap = 'lg',
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  background,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden',
        PADDING[padding],
        background,
        className
      )}
    >
      <div className={cn(CONTAINER.base, CONTAINER[container])}>
        {(title || subtitle) && (
          <div className={cn('mb-8 text-center', GAP.sm, 'flex flex-col')}>
            {title && (
              <h2
                className={cn(
                  'text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900',
                  titleClassName
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  'text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto',
                  subtitleClassName
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn(GAP[gap], 'flex flex-col')}>{children}</div>
      </div>
    </section>
  );
}
