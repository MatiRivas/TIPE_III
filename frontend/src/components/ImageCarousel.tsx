import { useState, useEffect } from 'react';

const slides = [
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200',
  'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200',
];

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />
      ))}
      {/* Overlay oscuro */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
    </div>
  );
}