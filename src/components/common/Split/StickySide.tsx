'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function StickySide(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateShadow = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      container.style.setProperty(
        '--scroll-shadow-top-opacity',
        isAtTop ? '0' : '1',
      );
      container.style.setProperty(
        '--scroll-shadow-bottom-opacity',
        isAtBottom ? '0' : '1',
      );
    };

    updateShadow();
    container.addEventListener('scroll', updateShadow, { passive: true });

    return () => {
      container.removeEventListener('scroll', updateShadow);
    };
  }, []);

  return (
    <div className="sm:sticky sm:top-4 sm:mt-4">
      <div
        ref={containerRef}
        className="scroll-shadow sm:max-h-[calc(100vh-2rem)] sm:overflow-y-auto"
      >
        {props.children}
      </div>
    </div>
  );
}
