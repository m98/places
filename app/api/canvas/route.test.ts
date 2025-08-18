import { GET, POST } from './route'
import { NextRequest } from 'next/server'
import { getAllSquares, updateSquare } from '../../../lib/database'

// Mock the database module
jest.mock('../../../lib/database', () => ({
  getAllSquares: jest.fn(),
  updateSquare: jest.fn(),
}))

const mockGetAllSquares = getAllSquares as jest.MockedFunction<typeof getAllSquares>
const mockUpdateSquare = updateSquare as jest.MockedFunction<typeof updateSquare>

describe('/api/canvas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all squares successfully', async () => {
      const mockSquares = [
        { x_coordinate: 0, y_coordinate: 0, color: '#FFFFFF', last_updated_at: '2024-01-01T00:00:00Z' },
        { x_coordinate: 1, y_coordinate: 1, color: '#FF0000', last_updated_at: '2024-01-01T00:00:00Z' },
      ]
      
      mockGetAllSquares.mockReturnValue(mockSquares)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ squares: mockSquares })
      expect(mockGetAllSquares).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockGetAllSquares.mockImplementation(() => {
        throw error
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch canvas' })
      expect(mockGetAllSquares).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST', () => {
    const createRequest = (body: any): NextRequest => {
      return {
        json: jest.fn().mockResolvedValue(body),
      } as any
    }

    it('should update a square successfully with valid data', async () => {
      const validBody = { x: 10, y: 15, color: '#FF0000' }
      const request = createRequest(validBody)

      mockUpdateSquare.mockReturnValue({ changes: 1 } as any)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(mockUpdateSquare).toHaveBeenCalledWith(10, 15, '#FF0000')
    })

    it('should reject invalid x coordinate (negative)', async () => {
      const invalidBody = { x: -1, y: 15, color: '#FF0000' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid coordinates' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject invalid x coordinate (too large)', async () => {
      const invalidBody = { x: 45, y: 15, color: '#FF0000' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid coordinates' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject invalid y coordinate (negative)', async () => {
      const invalidBody = { x: 10, y: -1, color: '#FF0000' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid coordinates' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject invalid y coordinate (too large)', async () => {
      const invalidBody = { x: 10, y: 45, color: '#FF0000' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid coordinates' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject non-numeric coordinates', async () => {
      const invalidBody = { x: '10', y: 15, color: '#FF0000' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid coordinates' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject invalid color format (not hex)', async () => {
      const invalidBody = { x: 10, y: 15, color: 'red' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid color format' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject invalid color format (short hex)', async () => {
      const invalidBody = { x: 10, y: 15, color: '#FF0' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid color format' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject invalid color format (long hex)', async () => {
      const invalidBody = { x: 10, y: 15, color: '#FF00000' }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid color format' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should reject non-string color', async () => {
      const invalidBody = { x: 10, y: 15, color: 123 }
      const request = createRequest(invalidBody)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid color format' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })

    it('should accept valid hex colors with lowercase', async () => {
      const validBody = { x: 10, y: 15, color: '#ff0000' }
      const request = createRequest(validBody)

      mockUpdateSquare.mockReturnValue({ changes: 1 } as any)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(mockUpdateSquare).toHaveBeenCalledWith(10, 15, '#ff0000')
    })

    it('should accept valid hex colors with uppercase', async () => {
      const validBody = { x: 10, y: 15, color: '#FF0000' }
      const request = createRequest(validBody)

      mockUpdateSquare.mockReturnValue({ changes: 1 } as any)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(mockUpdateSquare).toHaveBeenCalledWith(10, 15, '#FF0000')
    })

    it('should handle database errors gracefully', async () => {
      const validBody = { x: 10, y: 15, color: '#FF0000' }
      const request = createRequest(validBody)

      const error = new Error('Database update failed')
      mockUpdateSquare.mockImplementation(() => {
        throw error
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to update canvas' })
      expect(mockUpdateSquare).toHaveBeenCalledWith(10, 15, '#FF0000')
    })

    it('should handle JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to update canvas' })
      expect(mockUpdateSquare).not.toHaveBeenCalled()
    })
  })
})
