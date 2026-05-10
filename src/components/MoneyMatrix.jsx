import React, { useEffect, useRef } from 'react';

export default function MoneyMatrix() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = [];
    const maxParticles = 35; // 🔥 Оптимальное количество для визуала и нулевой нагрузки
    const symbols = ['$', '€', '¥', '₿', '₴', '£', 'zł', 'CHF'];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    };

    // Создаем частицы с разными размерами, скоростью и прозрачностью (для эффекта глубины)
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.3 + Math.random() * 0.8, // Очень плавное падение
          fontSize: 10 + Math.random() * 12, // Разные размеры
          opacity: 0.1 + Math.random() * 0.25, // Легкая прозрачность
          text: symbols[Math.floor(Math.random() * symbols.length)]
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      // 🔥 Главный секрет производительности: полностью очищаем кадр перед новой отрисовкой
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`; // Наш фирменный цвет индиго
        ctx.font = `${p.fontSize}px monospace`;
        ctx.fillText(p.text, p.x, p.y);

        // Двигаем символ вниз
        p.y += p.speed;

        // Если символ улетел за нижний край — возвращаем его наверх в случайное место
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.speed = 0.3 + Math.random() * 0.8;
          p.text = symbols[Math.floor(Math.random() * symbols.length)];
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
    />
  );
}