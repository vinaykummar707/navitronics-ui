import React, { useRef, useEffect, useState } from 'react';

const font8x8 = {
  'A': [
    0b01111110,
    0b01000001,
    0b01000001,
    0b01111110,
    0b01000001,
    0b01000001,
    0b01000001,
    0b01000001,
  ],
  'B': [
    0b01111111,
    0b01000001,
    0b01000001,
    0b01111111,
    0b01000001,
    0b01000001,
    0b01111111,
    0b00000000,
  ],
  ' ': [
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
  ],  // space
};

const LedMatrix = ({ text, scrollSpeed = 100 }) => {
  const canvasRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const drawText = (text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set the canvas width and height for a 16x16 grid
    const width = 16;
    const height = 16;
    canvas.width = width;
    canvas.height = height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    let xOffset = 0;

    // Loop over each character in the text and draw it to the canvas
    for (let charIndex = 0; charIndex < text.length; charIndex++) {
      const char = text[charIndex];
      const charBitmap = font8x8[char.toUpperCase()] || font8x8[' '];

      // Draw each 8x8 character
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if ((charBitmap[y] >> (7 - x)) & 1) {
            ctx.fillStyle = 'black'; // Set LED color (on)
            ctx.fillRect(xOffset + x, y, 1, 1);
          }
        }
      }

      // Move xOffset by 8 for the next character (8x8 characters)
      xOffset += 8;

      // If the total width exceeds 16, break the loop
      if (xOffset >= width) break;

      console.log(charBitmap)
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollOffset((prev) => (prev + 1) % (text.length * 8 + 8));  // Scroll the text

      // Reset when the text has scrolled all the way out of view
      if (scrollOffset >= text.length * 8) {
        setScrollOffset(0);
      }
    }, scrollSpeed);

    return () => clearInterval(interval);  // Cleanup interval on unmount
  }, [scrollOffset, text.length, scrollSpeed]);

  useEffect(() => {
    drawText(text);
  }, [text, scrollOffset]);

  return <canvas ref={canvasRef}></canvas>;
};

const TextToBitmap = () => {
  const [text, setText] = React.useState('HELLO WORLD'); // Example text

  return (
    <div>
      <h1>LED Matrix Text Display</h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <LedMatrix text={text} scrollSpeed={150} />
    </div>
  );
};

export default TextToBitmap;
