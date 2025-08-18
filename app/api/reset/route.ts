import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/database';

// Color name to hex value mapping
const COLOR_MAP: Record<string, string> = {
  'white': '#FFFFFF',
  'black': '#000000',
  'steelblue': '#4682B4',
  'teal': '#14B8A6',
  'darkorange': '#FF8C00',
  'midnightblue': '#191970',
  'antiquewhite': '#FAEBD7',
  'wheat': '#F5DEB3',
  'tomato': '#FF6347',
  'seagreen': '#2E8B57'
};

// Load and parse CSV matrix
const loadPixelMatrixFromCSV = (): string[][] => {
  try {
    const csvPath = path.join(process.cwd(), 'app/api/reset/vio_tile_logo_45x45.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    // Parse each row directly as hex colors (no header line to skip)
    const matrix: string[][] = [];
    
    for (let i = 0; i < lines.length && i < 45; i++) {
      const row = lines[i].split(',');
      const colorRow: string[] = [];
      
      for (let j = 0; j < 45 && j < row.length; j++) {
        const colorValue = row[j].trim();
        
        // Check if it's already a hex color, otherwise try to map it
        let hexColor = '#FFFFFF'; // Default to white
        
        if (colorValue.startsWith('#') && colorValue.length === 7) {
          // Already a hex color
          hexColor = colorValue.toUpperCase();
        } else {
          // Try to map from color name
          const colorName = colorValue.toLowerCase();
          hexColor = COLOR_MAP[colorName] || '#FFFFFF';
        }
        
        colorRow.push(hexColor);
      }
      
      // Ensure row has exactly 45 colors
      while (colorRow.length < 45) {
        colorRow.push('#FFFFFF');
      }
      
      matrix.push(colorRow);
    }
    
    // Ensure matrix has exactly 45 rows
    while (matrix.length < 45) {
      matrix.push(Array(45).fill('#FFFFFF'));
    }
    
    console.log(`Loaded ${matrix.length}x${matrix[0]?.length} pixel matrix from CSV`);
    return matrix;
  } catch (error) {
    console.error('Error loading CSV matrix:', error);
    // Return a fallback white matrix if CSV loading fails
    return Array(45).fill(null).map(() => Array(45).fill('#FFFFFF'));
  }
};

export async function GET() {
  try {
    console.log('Starting canvas reset...');
    
    // Load the Dutch landscape matrix from CSV
    const pixelMatrix = loadPixelMatrixFromCSV();
    
    // Clear all existing squares
    db.prepare('DELETE FROM squares').run();
    
    // Insert new pixel art
    const insertSquare = db.prepare(`
      INSERT INTO squares (x_coordinate, y_coordinate, color) 
      VALUES (?, ?, ?)
    `);
    
    const insertTransaction = db.transaction(() => {
      for (let y = 0; y < 45; y++) {
        for (let x = 0; x < 45; x++) {
          insertSquare.run(x, y, pixelMatrix[y][x]);
        }
      }
    });
    
    insertTransaction();
    
    console.log('Canvas reset complete!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!' 
    });
    
  } catch (error) {
    console.error('Error resetting canvas:', error);
    return NextResponse.json(
      { error: 'Failed to reset canvas' }, 
      { status: 500 }
    );
  }
}