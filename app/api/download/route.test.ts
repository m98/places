// Mock the database module
jest.mock('../../../lib/database', () => ({
  getAllSquares: jest.fn(),
}));

import { GET } from './route';
import { getAllSquares } from '../../../lib/database';

const mockGetAllSquares = getAllSquares as jest.MockedFunction<typeof getAllSquares>;

describe('/api/download', () => {
  beforeEach(() => {
    mockGetAllSquares.mockClear();
  });

  it('should return a PNG file with correct headers', async () => {
    // Mock some sample squares
    mockGetAllSquares.mockReturnValue([
      { x_coordinate: 0, y_coordinate: 0, color: '#FF0000', last_updated_at: '2023-01-01' },
      { x_coordinate: 1, y_coordinate: 0, color: '#00FF00', last_updated_at: '2023-01-01' },
      { x_coordinate: 0, y_coordinate: 1, color: '#0000FF', last_updated_at: '2023-01-01' },
    ]);

    const response = await GET();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="canvas-artwork.png"');
    expect(response.headers.get('Content-Length')).toBeTruthy();
  });

  it('should handle empty canvas', async () => {
    // Mock empty canvas
    mockGetAllSquares.mockReturnValue([]);

    const response = await GET();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockGetAllSquares.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const response = await GET();
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to generate download');
  });
});