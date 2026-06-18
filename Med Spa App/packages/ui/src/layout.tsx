import React from 'react';
import clsx from 'clsx';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return <div className={clsx('min-h-screen bg-gray-50 dark:bg-slate-900', className)}>{children}</div>;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-white dark:bg-slate-950 p-6 shadow-sm border border-gray-100 dark:border-slate-800',
        className
      )}
    >
      {children}
    </div>
  );
}
