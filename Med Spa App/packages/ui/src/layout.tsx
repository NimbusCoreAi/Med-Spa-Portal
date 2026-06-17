import React from 'react';
import clsx from 'clsx';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return <div className={clsx('min-h-screen bg-gray-50', className)}>{children}</div>;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('rounded-lg bg-white p-6 shadow-sm border border-gray-100', className)}>
      {children}
    </div>
  );
}
