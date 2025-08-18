import { NextRequest, NextResponse } from 'next/server';
import { getAllSquares, updateSquare } from '@/lib/database';

export async function GET() {
  try {
    const squares = getAllSquares();
    return NextResponse.json({ squares });
  } catch (error) {
    console.error('Error fetching canvas:', error);
    return NextResponse.json({ error: 'Failed to fetch canvas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { x, y, color } = body;

    // Validate coordinates (45x45 grid)
    if (typeof x !== 'number' || typeof y !== 'number' || 
        x < 0 || x >= 45 || y < 0 || y >= 45) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    // Validate color format (hex color)
    if (typeof color !== 'string' || !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json({ error: 'Invalid color format' }, { status: 400 });
    }

    updateSquare(x, y, color);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating canvas:', error);
    return NextResponse.json({ error: 'Failed to update canvas' }, { status: 500 });
  }
}