
import { useEffect, useState } from 'react';

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: {
    x: number;
    y: number;
  };
}

const ConfettiEffect = () => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9fff', '#9d4edd', '#ff6b35'];

  useEffect(() => {
    // Generate initial confetti
    const newConfetti: Confetti[] = [];
    for (let i = 0; i < 100; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        }
      });
    }
    setConfetti(newConfetti);

    // Animation loop
    const interval = setInterval(() => {
      setConfetti(prev => 
        prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocity.x,
          y: piece.y + piece.velocity.y,
          rotation: piece.rotation + 5,
          velocity: {
            ...piece.velocity,
            y: piece.velocity.y + 0.1 // gravity
          }
        })).filter(piece => piece.y < window.innerHeight + 20)
      );
    }, 16);

    // Cleanup
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setConfetti([]);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute transition-transform duration-75"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
