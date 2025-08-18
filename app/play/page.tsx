'use client';

import { useState, useEffect, useCallback } from 'react';
import { Palette, Timer, Paintbrush, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Square {
  x_coordinate: number;
  y_coordinate: number;
  color: string;
  last_updated_at: string;
}

// Grid configuration - 45x45 for full page experience
const GRID_SIZE = 45;

// Professional Art-Inspired Color Palette
// Based on traditional art palettes but optimized for digital pixel art
const COLORS = [
  // Essential neutrals - Foundation of any palette
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Warm White', value: '#FDF6E3' },
  { name: 'Cool Gray', value: '#8B9DC3' },
  { name: 'Warm Gray', value: '#A0958A' },
  { name: 'Charcoal', value: '#2C2C2C' },
  { name: 'Pure Black', value: '#000000' },
  
  // Warm palette - Inspired by classical painting
  { name: 'Cadmium Yellow', value: '#FFD700' },
  { name: 'Yellow Ochre', value: '#CC7722' },
  { name: 'Vermillion', value: '#E34234' },
  { name: 'Burnt Sienna', value: '#8B4513' },
  { name: 'Raw Umber', value: '#734A12' },
  
  // Cool palette - For atmosphere and depth
  { name: 'Cerulean Blue', value: '#007BA7' },
  { name: 'Ultramarine', value: '#4166F5' },
  { name: 'Prussian Blue', value: '#003153' },
  { name: 'Viridian', value: '#40826D' },
  { name: 'Sap Green', value: '#507D2A' },
  
  // Earth tones - Natural and versatile
  { name: 'Titanium White', value: '#F8F8F0' },
  { name: 'Naples Yellow', value: '#FADA5E' },
  { name: 'Raw Sienna', value: '#D2691E' },
  { name: 'Burnt Umber', value: '#8A3324' },
  { name: 'Payne Gray', value: '#536878' },
  
  // Accent colors - For highlights and special elements
  { name: 'Alizarin Crimson', value: '#E32636' },
  { name: 'Cadmium Orange', value: '#FF6103' },
  { name: 'Permanent Violet', value: '#8F47B3' },
  { name: 'Phthalo Green', value: '#123524' },
  { name: 'Dioxazine Purple', value: '#5B2C87' },
  
  // Modern additions - Popular in contemporary digital art
  { name: 'Coral Pink', value: '#FF7F7F' },
  { name: 'Mint Green', value: '#98FB98' },
  { name: 'Lavender', value: '#E6E6FA' },
  { name: 'Peach', value: '#FFCBA4' },
  { name: 'Sky Blue', value: '#87CEEB' },
  
  // Deep tones - For shadows and contrast
  { name: 'Forest Green', value: '#228B22' },
  { name: 'Burgundy', value: '#800020' },
  { name: 'Navy Blue', value: '#191970' },
  { name: 'Plum', value: '#8E4585' },
  { name: 'Chocolate', value: '#7B3F00' },
];

export default function PlayPage() {
  const [squares, setSquares] = useState<Square[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [currentPosition, setCurrentPosition] = useState({ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }); // Start in center
  const [paintCount, setPaintCount] = useState(20);
  const [timeUntilNextPaint, setTimeUntilNextPaint] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Toolbar dragging state
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isToolbarDragging, setIsToolbarDragging] = useState(false);
  const [toolbarDragStart, setToolbarDragStart] = useState({ x: 0, y: 0 });
  
  // Compact mode state
  const [isCompactMode, setIsCompactMode] = useState(false);
  
  // Feedback state
  const [showOutOfPaintAlert, setShowOutOfPaintAlert] = useState(false);

  // Fetch canvas data
  const fetchCanvas = useCallback(async () => {
    try {
      const response = await fetch('/api/canvas');
      const data = await response.json();
      setSquares(data.squares);
    } catch (error) {
      console.error('Error fetching canvas:', error);
    }
  }, []);

  // Paint square
  const paintSquare = useCallback(async (x: number, y: number, color: string) => {
    // Check if user has paint credits
    if (paintCount <= 0 && timeUntilNextPaint > 0) {
      setShowOutOfPaintAlert(true);
      setTimeout(() => setShowOutOfPaintAlert(false), 3000);
      return;
    }

    // Check if trying to paint same color on same square (avoid credit waste)
    const currentSquare = squares.find(s => s.x_coordinate === x && s.y_coordinate === y);
    if (currentSquare && currentSquare.color === color) {
      // Don't waste paint credit for painting same color
      return;
    }

    try {
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, color }),
      });

      if (response.ok) {
        // Update local state immediately for instant feedback
        setSquares(prev => prev.map(square => 
          square.x_coordinate === x && square.y_coordinate === y
            ? { ...square, color }
            : square
        ));

        // Decrease paint count only when actually painting something different
        setPaintCount(prev => {
          const newCount = Math.max(0, prev - 1);
          if (newCount === 0) {
            setTimeUntilNextPaint(5);
          }
          return newCount;
        });
      }
    } catch (error) {
      console.error('Error painting square:', error);
    }
  }, [paintCount, timeUntilNextPaint, squares]);

  // Calculate square size based on zoom
  const getSquareSize = useCallback(() => {
    const baseSize = 16; // Base size in pixels
    return Math.round(baseSize * zoomLevel);
  }, [zoomLevel]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
    }
  }, []);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      const container = document.querySelector('.canvas-container') as HTMLElement;
      if (container) {
        container.scrollLeft -= deltaX;
        container.scrollTop -= deltaY;
      }
      
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsToolbarDragging(false);
  }, []);

  // Toolbar drag handlers
  const handleToolbarMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsToolbarDragging(true);
    setToolbarDragStart({ 
      x: event.clientX - toolbarPosition.x, 
      y: event.clientY - toolbarPosition.y 
    });
  }, [toolbarPosition]);

  const handleToolbarMouseMove = useCallback((event: MouseEvent) => {
    if (isToolbarDragging) {
      const newX = event.clientX - toolbarDragStart.x;
      const newY = event.clientY - toolbarDragStart.y;
      
      // Constrain to viewport bounds with some padding
      const padding = 20;
      const maxX = window.innerWidth - padding;
      const maxY = window.innerHeight - padding;
      const minX = -window.innerWidth / 2 + padding;
      const minY = -window.innerHeight / 2 + padding;
      
      setToolbarPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    }
  }, [isToolbarDragging, toolbarDragStart]);

  // Auto-scroll when navigating outside viewport
  const scrollToPosition = useCallback((x: number, y: number) => {
    const container = document.querySelector('.canvas-container') as HTMLElement;
    if (container) {
      const squareSize = getSquareSize();
      const targetX = x * squareSize - container.clientWidth / 2;
      const targetY = y * squareSize - container.clientHeight / 2;
      
      container.scrollTo({
        left: Math.max(0, targetX),
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    }
  }, [getSquareSize]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    
    // Handle zoom with + and - keys
    if (event.ctrlKey || event.metaKey) {
      if (key === '=' || key === '+') {
        event.preventDefault();
        setZoomLevel(prev => Math.min(3, prev + 0.1));
        return;
      }
      if (key === '-') {
        event.preventDefault();
        setZoomLevel(prev => Math.max(0.5, prev - 0.1));
        return;
      }
      if (key === '0') {
        event.preventDefault();
        setZoomLevel(1);
        return;
      }
    }
    
    // Prevent default for space key to avoid double triggers
    if (key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      paintSquare(currentPosition.x, currentPosition.y, selectedColor);
      return;
    }
    
    setCurrentPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          newY = Math.max(0, prev.y - 1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          newY = Math.min(GRID_SIZE - 1, prev.y + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          newX = Math.max(0, prev.x - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          newX = Math.min(GRID_SIZE - 1, prev.x + 1);
          break;
        default:
          return prev;
      }

      // Auto-scroll to new position
      setTimeout(() => scrollToPosition(newX, newY), 0);
      
      return { x: newX, y: newY };
    });
  }, [currentPosition.x, currentPosition.y, selectedColor, paintSquare, scrollToPosition]);

  // Set up keyboard, wheel, and mouse listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleToolbarMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleToolbarMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleWheel, handleMouseMove, handleToolbarMouseMove, handleMouseUp]);

  // Initial fetch and polling
  useEffect(() => {
    fetchCanvas();
    const interval = setInterval(fetchCanvas, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [fetchCanvas]);

  // Paint count timer
  useEffect(() => {
    if (timeUntilNextPaint > 0) {
      const timer = setTimeout(() => {
        setTimeUntilNextPaint(prev => {
          const newTime = prev - 1;
          if (newTime === 0 && paintCount < 20) {
            setPaintCount(count => Math.min(20, count + 1));
            return paintCount < 19 ? 5 : 0; // Continue timer if not at max
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeUntilNextPaint, paintCount]);

  const getSquareColor = (x: number, y: number) => {
    const square = squares.find(s => s.x_coordinate === x && s.y_coordinate === y);
    return square?.color || '#FFFFFF';
  };

  const isCurrentSquare = (x: number, y: number) => {
    return currentPosition.x === x && currentPosition.y === y;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Full-screen scrollable Canvas Grid */}
      <div 
        className="canvas-container h-screen overflow-auto p-4 select-none"
        style={{ 
          scrollBehavior: 'smooth',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <div 
          className="grid bg-white rounded-lg shadow-lg border border-gray-200 mx-auto my-4"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gap: `${Math.max(1, Math.round(2 * zoomLevel))}px`,
            width: `${GRID_SIZE * getSquareSize() + (GRID_SIZE - 1) * Math.max(1, Math.round(2 * zoomLevel))}px`,
            height: `${GRID_SIZE * getSquareSize() + (GRID_SIZE - 1) * Math.max(1, Math.round(2 * zoomLevel))}px`,
            padding: `${Math.max(4, Math.round(16 * zoomLevel))}px`
          }}
        >
          {Array.from({ length: GRID_SIZE }, (_, y) =>
            Array.from({ length: GRID_SIZE }, (_, x) => (
              <div
                key={`${x}-${y}`}
                className={`border border-gray-300/30 transition-all duration-100 cursor-pointer relative group ${
                  isCurrentSquare(x, y) 
                    ? 'ring-2 ring-purple-400 z-10 shadow-md' 
                    : 'hover:ring-1 hover:ring-blue-300'
                }`}
                style={{ 
                  backgroundColor: getSquareColor(x, y),
                  width: `${getSquareSize()}px`,
                  height: `${getSquareSize()}px`,
                  borderWidth: `${Math.max(1, Math.round(zoomLevel))}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  paintSquare(x, y, selectedColor);
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {isCurrentSquare(x, y) && (
                  <div className="absolute inset-0 bg-purple-400/20 flex items-center justify-center">
                    <div 
                      className="rounded-full bg-purple-600 animate-pulse"
                      style={{
                        width: `${Math.max(2, Math.round(4 * zoomLevel))}px`,
                        height: `${Math.max(2, Math.round(4 * zoomLevel))}px`
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Unified Draggable Toolbar */}
      <div 
        className="fixed bottom-6 left-1/2 z-50 select-none"
        style={{
          transform: `translate(calc(-50% + ${toolbarPosition.x}px), ${toolbarPosition.y}px)`
        }}
      >
        <div className={`relative bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transition-all duration-300 ${isCompactMode ? 'p-3 w-[320px]' : 'p-5 w-[750px]'}`}>
          {/* Dark glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/40 rounded-3xl" />
          
          {/* Drag handle area - covers entire toolbar except buttons */}
          <div 
            className="absolute inset-0 rounded-3xl"
            onMouseDown={handleToolbarMouseDown}
            style={{ cursor: isToolbarDragging ? 'grabbing' : 'grab' }}
          />
          
          {/* Compact toggle button - top right, larger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCompactMode(!isCompactMode);
            }}
            className="absolute -top-2 -right-2 bg-black/50 backdrop-blur-md rounded-full p-2 hover:bg-black/60 transition-all duration-200 border border-white/40 shadow-lg"
            style={{ zIndex: 20 }}
            title={isCompactMode ? "Expand toolbar" : "Compact toolbar"}
          >
            {isCompactMode ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>

          <div className={`relative flex items-center ${isCompactMode ? 'gap-0' : 'gap-6'}`}>
            {/* Zoom Controls - Left Side (hidden in compact mode) */}
            {!isCompactMode && (
              <div className="flex flex-col items-center gap-3 min-w-[100px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/90">Zoom</span>
                  <div className="text-xs text-white/80 font-medium px-2 py-1 bg-white/20 rounded-lg">
                    {Math.round(zoomLevel * 100)}%
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Color Palette - Center */}
            <div className={`flex flex-col items-center ${isCompactMode ? 'gap-2 w-full' : 'gap-3 flex-1'}`}>
              {isCompactMode ? (
                /* Compact mode header - single row */
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3 text-white/90" />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-3 h-3 text-white/70" />
                    <span className="text-xs text-white/80 bg-white/20 px-1.5 py-0.5 rounded">
                      {paintCount}/20
                    </span>
                    {timeUntilNextPaint > 0 && (
                      <span className="text-xs text-orange-300">{timeUntilNextPaint}s</span>
                    )}
                  </div>
                </div>
              ) : (
                /* Full mode header */
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-4 h-4 text-white/90" />
                  <span className="text-sm font-medium text-white/90">Colors</span>
                  {selectedColor && (
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white/50 shadow-lg"
                      style={{ backgroundColor: selectedColor }}
                    />
                  )}
                </div>
              )}
              
              {/* Color grid - much more compact in compact mode */}
              <div className={`grid ${isCompactMode ? 'grid-cols-7 gap-1' : 'grid-cols-12 gap-1.5'}`}>
                {COLORS.map((color, index) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`${isCompactMode ? 'w-4 h-4' : 'w-6 h-6'} rounded-lg transition-all duration-200 transform border border-white/30 ${
                      selectedColor === color.value 
                        ? 'scale-110 shadow-lg ring-2 ring-white/50' 
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <div className={`${isCompactMode ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-white/80 shadow-sm mx-auto`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Paint Charge Info - Right Side (hidden in compact mode) */}
            {!isCompactMode && (
              <div className="flex flex-col items-center gap-3 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-white/90" />
                  <span className="text-sm font-medium text-white/90">Paint</span>
                  <span className="text-sm font-bold text-white bg-white/20 px-2 py-1 rounded-lg ml-2">
                    {paintCount}/20
                  </span>
                </div>
                
                {/* Horizontal paint bar */}
                <div className="w-full">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(paintCount / 20) * 100}%` }}
                      />
                    </div>
                    
                    {/* Timer integration */}
                    {timeUntilNextPaint > 0 ? (
                      <div className="flex items-center gap-1 text-orange-300">
                        <Timer className="w-3 h-3" />
                        <span className="text-sm font-bold min-w-[20px]">{timeUntilNextPaint}s</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Out of Paint Alert */}
      {showOutOfPaintAlert && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl border border-white/20 p-6 max-w-sm animate-bounce">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-white" />
              <h3 className="text-lg font-bold">Out of Paint!</h3>
            </div>
            <p className="text-white/90 text-sm mb-3">
              You've used all your paint credits. Wait a moment for them to recharge!
            </p>
            <div className="flex items-center gap-2 text-white/80">
              <Timer className="w-4 h-4" />
              <span className="text-sm">Recharging in {timeUntilNextPaint}s...</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}