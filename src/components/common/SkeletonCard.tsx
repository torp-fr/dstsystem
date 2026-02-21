import React from 'react';

/**
 * SkeletonCard — Loading skeleton for data cards
 *
 * Shows a subtle pulsing animation while data is loading.
 * Standard size: bg-muted animate-pulse rounded-xl h-40
 */

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export default function SkeletonCard({
  count = 1,
  className = ''
}: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-muted animate-pulse rounded-xl h-40 ${className}`}
        />
      ))}
    </>
  );
}
