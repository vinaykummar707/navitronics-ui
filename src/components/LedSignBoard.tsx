import axiosInstance from '@/config/axios';
import React, { useState, useEffect, useRef } from 'react';

const LEDBitmapSimulator = ({text,language,rows,cols}) => {
//   const [rows, setRows] = useState(16);
//   const [cols, setColumns] = useState(96);
  const [ledSize, setLedSize] = useState(6);
  const [ledSpacing, setLedSpacing] = useState(1);
  const [bitmapText, setBitmapText] = useState('');
  const [ledMatrix, setLedMatrix] = useState([]);
  const [ledColor, setLedColor] = useState('#ff0000');
  const [bgColor, setBgColor] = useState('#000000');
  const [viewportWidth, setViewportWidth] = useState(800);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('left');
  const [scrollSpeed, setScrollSpeed] = useState(100);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollIntervalRef = useRef(null);



  useEffect(() => {
    setViewportWidth(Math.min(window.innerWidth - 40, cols * (ledSize + ledSpacing)));
  }, [cols, ledSize, ledSpacing]);

  useEffect(() => {
	console.log(text,language)
    const fetchBitmap = async () => {
      try {
        const response = await axiosInstance.post('/routes/getBitmapSimulation', JSON.stringify({
            text: text,
            language: language
          }));

       

        
		console.log(response);
        setBitmapText(response.data || '');
      } catch (error) {
        console.error('Error fetching bitmap:', error);
      }
    };

      fetchBitmap();

	  if(text.scrollType === 'Left To Right'){
		setIsScrolling(true);
		setScrollDirection('right');	
	}
	if(text.scrollType === 'Right To Left'){
		setIsScrolling(true);
		setScrollDirection('left');
	}
	if(text.scrollType === 'Fixed'){
		setIsScrolling(false);
	}
	setScrollSpeed(text.scrollSpeed);
    
  }, [
	text,
	text.text,
	language,
	text.scrollType,
	text.position,
	text.scrollSpeed,
	text.fontSize,
	text.fontWeight,
	text.fontHeight,
	text.x_offset,
	text.y_offset,
	text.spacing
  ]);

  // Process bitmap text into matrix with scrolling support
  const processBitmapText = (text, offset = 0) => {
    if (!text) return Array(rows).fill().map(() => Array(cols).fill(0));
    
    const lines = text.split('\n').filter(line => line.length > 0);
    const matrix = [];
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      const line = lines[i] || '';
      
      // Handle scrolling by applying offset
      for (let j = 0; j < cols; j++) {
        // Skip if line is empty
        if (line.length === 0) {
          row.push(0);
          continue;
        }
        
        const charPos = (j + offset) % line.length;
        // Handle negative positions for right scroll
        const adjustedPos = charPos < 0 ? line.length + charPos : charPos;
        row.push(adjustedPos < line.length && line[adjustedPos] === '#' ? 1 : 0);
      }
      
      matrix.push(row);
    }
    
    return matrix;
  };

  useEffect(() => {
    setLedMatrix(processBitmapText(bitmapText, scrollOffset));
  }, [bitmapText, rows, cols, scrollOffset]);

  // Handle scrolling logic
  useEffect(() => {
    if (isScrolling) {
      // Clear any existing interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      
      // Set up new scrolling interval
      scrollIntervalRef.current = setInterval(() => {
        setScrollOffset(prev => {
          const direction = scrollDirection === 'left' ? 1 : -1;
          
          // For left scrolling, we increase the offset
          // For right scrolling, we decrease the offset
          let newOffset = prev + direction;
          
          // If we have bitmap data, wrap around based on its width
          if (bitmapText) {
            const maxWidth = Math.max(...bitmapText.split('\n').map(line => line.length || 1));
            if (maxWidth > 0) {
              // Ensure offset wraps properly for both directions
              newOffset = ((newOffset % maxWidth) + maxWidth) % maxWidth;
            }
          }
          
          return newOffset;
        });
      }, scrollSpeed);
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    // Cleanup on unmount
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isScrolling, scrollDirection, scrollSpeed, bitmapText]);

  const handleImportSample = () => {
    setBitmapText(sampleBitmap);
    // Set dimensions based on the sample bitmap
    const lines = sampleBitmap.trim().split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    setRows(lines.length);
    // Reset scroll offset
    setScrollOffset(0);
  };

  const handleClear = () => {
    setBitmapText('');
    setLedMatrix(Array(rows).fill().map(() => Array(cols).fill(0)));
    setScrollOffset(0);
    setIsScrolling(false);
  };

  const toggleLed = (rowIndex, colIndex) => {
    if (isScrolling) return; // Disable editing while scrolling
    
    const newMatrix = [...ledMatrix];
    if (newMatrix[rowIndex] && newMatrix[rowIndex][colIndex] !== undefined) {
      newMatrix[rowIndex][colIndex] = newMatrix[rowIndex][colIndex] ? 0 : 1;
      setLedMatrix(newMatrix);
      
      // Update bitmap text based on the matrix
      const lines = bitmapText.split('\n');
      const updatedLines = [...lines];
      
      // Ensure we have enough lines
      while (updatedLines.length <= rowIndex) {
        updatedLines.push('.'.repeat(cols));
      }
      
      // Convert the line to an array, modify it, and convert back to string
      let lineArray = Array.from(updatedLines[rowIndex] || '.'.repeat(cols));
      while (lineArray.length <= colIndex) {
        lineArray.push('.');
      }
      lineArray[colIndex] = newMatrix[rowIndex][colIndex] ? '#' : '.';
      updatedLines[rowIndex] = lineArray.join('');
      
      setBitmapText(updatedLines.join('\n'));
    }
  };

  // Calculate container width based on LED size
  const containerStyle = {
    // width: `${viewportWidth}px`,
  };

  const ledGridStyle = {
    // display: 'inline-block',
    padding: `${ledSpacing * 0}px`,
    // width: `${cols * (ledSize + ledSpacing) + ledSpacing}px`
  };

  const toggleScrolling = () => {
    setIsScrolling(!isScrolling);
  };

  return (
    <div className=" ">
      {/* <h2 className="text-2xl font-bold mb-2">LED Bitmap Simulator</h2> */}
      
      {/* <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">Rows:</label>
          <input 
            type="number" 
            min="1" 
            max="50"
            value={rows} 
            onChange={(e) => setRows(Number(e.target.value))}
            className="border rounded p-1 w-24" 
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">Columns:</label>
          <input 
            type="number" 
            min="1" 
            max="200"
            value={cols} 
            onChange={(e) => setColumns(Number(e.target.value))}
            className="border rounded p-1 w-24" 
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">LED Size:</label>
          <input 
            type="number" 
            min="1" 
            max="20"
            value={ledSize} 
            onChange={(e) => setLedSize(Number(e.target.value))}
            className="border rounded p-1 w-24" 
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">LED Spacing:</label>
          <input 
            type="number" 
            min="0" 
            max="5"
            value={ledSpacing} 
            onChange={(e) => setLedSpacing(Number(e.target.value))}
            className="border rounded p-1 w-24" 
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">LED Color:</label>
          <input 
            type="color" 
            value={ledColor} 
            onChange={(e) => setLedColor(e.target.value)}
            className="border rounded p-1 w-24 h-8" 
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">Background:</label>
          <input 
            type="color" 
            value={bgColor} 
            onChange={(e) => setBgColor(e.target.value)}
            className="border rounded p-1 w-24 h-8" 
          />
        </div>
      </div> */}
      
      {/* Scrolling Controls */}
      {/* <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-100 rounded">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="scroll-toggle" 
            checked={isScrolling} 
            onChange={toggleScrolling}
            className="mr-2"
          />
          <label htmlFor="scroll-toggle" className="font-medium">Enable Scrolling</label>
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">Direction:</label>
          <select 
            value={scrollDirection} 
            onChange={(e) => setScrollDirection(e.target.value)}
            className="border rounded p-1"
          >
            <option value="left">Left to Right</option>
            <option value="right">Right to Left</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">Speed (ms):</label>
          <input 
            type="number" 
            
            value={scrollSpeed} 
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
            className="border rounded p-1 w-24" 
          />
        </div>
      </div> */}
      
      {/* <div className="flex gap-2 mb-4">
        <button 
          onClick={handleImportSample} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Import Sample
        </button>
        <button 
          onClick={handleClear} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear
        </button>
      </div> */}
      
      <div style={containerStyle} className="">
        <div className='bg-neutral-900 ' style={ledGridStyle}>
          {ledMatrix.map((row, rowIndex) => (
            <div key={rowIndex} style={{ height: `${ledSize + ledSpacing}px`, lineHeight: 0 }}>
              {row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => toggleLed(rowIndex, colIndex)}
				  className={`${cell ? 'bg-amber-500' : 'bg-neutral-800'} rounded-full`}
                  style={{
                    width: `${ledSize}px`,
                    height: `${ledSize}px`,
                    display: 'inline-block',
                    margin: `0 ${ledSpacing}px 0 0`,
                    cursor: isScrolling ? 'default' : 'pointer',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* <div className="flex flex-col">
        <label className="font-medium mb-1">Bitmap Text:</label>
        <textarea 
          value={bitmapText} 
          onChange={(e) => setBitmapText(e.target.value)}
          className="border rounded p-2 font-mono text-xs"
          rows="10"
          style={{ whiteSpace: 'pre', overflowX: 'auto' }}
        />
      </div> */}
      
     
    </div>
  );
};

export default LEDBitmapSimulator;