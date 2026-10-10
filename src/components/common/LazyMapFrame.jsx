import React, { useEffect, useRef, useState } from 'react';

// Google Maps embed that loads only when it scrolls near the screen (the embed pulls in about
// 400 KB of map scripts, which would otherwise compete with the page's first paint on phones).
const LazyMapFrame = ({ src, title }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show || !ref.current) return undefined;
    if (!('IntersectionObserver' in window)) { const t = setTimeout(() => setShow(true), 0); return () => clearTimeout(t); }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show]);
  return (
    <div ref={ref} className="w-full h-full bg-gray-100">
      {show && (
        <iframe src={src} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title={title} />
      )}
    </div>
  );
};

export default LazyMapFrame;
