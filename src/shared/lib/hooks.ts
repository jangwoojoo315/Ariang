'use client';
import { useState, useEffect } from 'react';

export function useWindowWidth() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    window.dispatchEvent(new Event('resize'));
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}
