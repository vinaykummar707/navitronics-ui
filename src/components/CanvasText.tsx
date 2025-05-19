import React, { useState, useEffect, useRef } from 'react';

type MarqueeDirection = 'none' | 'ltr' | 'rtl';
type Alignment = 'start' | 'center' | 'end';

interface LEDMatrixProps {
  rows: number;
  columns: number;
  pattern?: string[];
  dotSize?: number;
  dotSpacing?: number;
  onColor?: string;
  offColor?: string;
  marqueeDirection?: MarqueeDirection;
  scrollSpeed?: number;
  alignment?: Alignment;
}

const LEDMatrix: React.FC<LEDMatrixProps> = ({
  rows,
  columns,
  pattern,
  dotSize = 4,
  dotSpacing = 2,
  onColor = '#ffbf00',
  offColor = '#000',
  marqueeDirection = 'none',
  scrollSpeed = 2,
  alignment = 'center'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(0);
  const [matrix, setMatrix] = useState<boolean[][]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (pattern && pattern.length > 0) {
      const newMatrix = pattern.map(row => 
        row.split('').map(char => char === '#')
      );
      setMatrix(newMatrix);
    } else {
      const newMatrix = Array(rows).fill(0).map(() => Array(columns).fill(false));
      setMatrix(newMatrix);
    }
  }, [rows, columns, pattern]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalDotSize = dotSize + dotSpacing;
    const matrixWidth = columns * totalDotSize;
    const matrixHeight = rows * totalDotSize;
    
    canvas.width = matrixWidth;
    canvas.height = matrixHeight;

    const drawMatrix = (offsetX: number = 0) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const patternWidth = matrix[0]?.length || 0;
      const patternHeight = matrix.length;
      let startX = 0;
      
      // Calculate vertical centering offset
      const startY = Math.floor((rows - patternHeight) / 2) * totalDotSize;

      if (marqueeDirection === 'none' && patternWidth < columns) {
        switch (alignment) {
          case 'center':
            startX = Math.floor((columns - patternWidth) / 2) * totalDotSize;
            break;
          case 'end':
            startX = (columns - patternWidth) * totalDotSize;
            break;
          default: // 'start'
            startX = 0;
        }
      }

      matrix.forEach((row, rowIndex) => {
        row.forEach((isOn, colIndex) => {
          let x = colIndex * totalDotSize + startX;

          if (marqueeDirection !== 'none') {
            x = (x + offsetX) % (canvas.width + matrixWidth) - matrixWidth;
            if (x < -dotSize) x += canvas.width + matrixWidth;
          }

          // Add startY to vertically center the pattern
          const y = rowIndex * totalDotSize + dotSize/2 + startY;

          if (x >= -dotSize && x <= canvas.width + dotSize) {
            ctx.beginPath();
            ctx.arc(x + dotSize/2, y, dotSize/2, 0, Math.PI * 2);
            ctx.fillStyle = isOn ? onColor : offColor;
            ctx.fill();
          }
        });
      });
    };

    const animate = () => {
      if (marqueeDirection !== 'none') {
        const newPosition = marqueeDirection === 'ltr' 
          ? position + scrollSpeed 
          : position - scrollSpeed;
        setPosition(newPosition);
        drawMatrix(newPosition);
      } else {
        drawMatrix(0);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [matrix, dotSize, dotSpacing, onColor, offColor, marqueeDirection, scrollSpeed, position, alignment, columns]);

  // Handle click to toggle LED state
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const totalDotSize = dotSize + dotSpacing;
    const col = Math.floor(x / totalDotSize);
    const row = Math.floor(y / totalDotSize);

    if (row >= 0 && row < rows && col >= 0 && col < columns) {
      const newMatrix = matrix.map((r, i) =>
        i === row ? r.map((cell, j) => j === col ? !cell : cell) : r
      );
      setMatrix(newMatrix);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        backgroundColor: '#141414',
      }}
    />
  );
};

export default LEDMatrix;