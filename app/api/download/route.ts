import { NextResponse } from 'next/server';
import { getAllSquares } from '@/lib/database';
import sharp from 'sharp';

const GRID_SIZE = 45;
const PIXEL_SIZE = 10; // Each square will be 10x10 pixels in the output

export async function GET() {
  try {
    // Fetch current canvas state
    const squares = getAllSquares();
    
    // Create a map for quick lookup of square colors
    const squareMap = new Map<string, string>();
    squares.forEach(square => {
      squareMap.set(`${square.x_coordinate},${square.y_coordinate}`, square.color);
    });
    
    // Calculate final image dimensions
    const imageWidth = GRID_SIZE * PIXEL_SIZE;
    const imageHeight = GRID_SIZE * PIXEL_SIZE;
    
    // Create pixel data buffer (RGBA format)
    const pixelData = Buffer.alloc(imageWidth * imageHeight * 4);
    
    // Fill pixel data
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Get color for this square (default to white if not found)
        const color = squareMap.get(`${x},${y}`) || '#FFFFFF';
        
        // Convert hex to RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // Fill the pixels for this square (PIXEL_SIZE x PIXEL_SIZE)
        for (let py = 0; py < PIXEL_SIZE; py++) {
          for (let px = 0; px < PIXEL_SIZE; px++) {
            const pixelY = y * PIXEL_SIZE + py;
            const pixelX = x * PIXEL_SIZE + px;
            const pixelIndex = (pixelY * imageWidth + pixelX) * 4;
            
            pixelData[pixelIndex] = r;     // Red
            pixelData[pixelIndex + 1] = g; // Green
            pixelData[pixelIndex + 2] = b; // Blue
            pixelData[pixelIndex + 3] = 255; // Alpha (fully opaque)
          }
        }
      }
    }
    
    // Create PNG using sharp
    const pngBuffer = await sharp(pixelData, {
      raw: {
        width: imageWidth,
        height: imageHeight,
        channels: 4
      }
    })
    .png()
    .toBuffer();
    
    // Return the PNG file
    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="canvas-artwork.png"',
        'Content-Length': pngBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 });
  }
}