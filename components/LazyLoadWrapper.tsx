"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  onVisible?: () => void;
}

export function LazyLoadWrapper({
  children,
  fallback = null,
  rootMargin = "100px",
  threshold = 0.1,
  onVisible,
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, onVisible]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
}