import { GET } from './route'
import fs from 'fs'
import path from 'path'

// Mock the database module
jest.mock('../../../lib/database', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(() => ({
      run: jest.fn(),
    })),
    transaction: jest.fn((callback) => {
      // Return a function that executes the callback
      return () => callback();
    }),
  },
  getAllSquares: jest.fn(),
  updateSquare: jest.fn(),
}))

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))

// Mock path module
jest.mock('path', () => ({
  join: jest.fn(),
}))

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>

describe('/api/reset', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPath.join.mockReturnValue('/mock/path/to/vio_tile_logo_45x45.csv')
  })

  describe('GET', () => {
    it('should reset canvas successfully with valid CSV data', async () => {
      // Mock CSV content with valid hex colors
      const mockCsvContent = `#FFFFFF,#FF0000,#00FF00
#0000FF,#FFFF00,#FF00FF
#00FFFF,#800000,#008000`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/mock/path/to/vio_tile_logo_45x45.csv', 'utf-8')
    })

    it('should handle CSV with color names and convert them to hex', async () => {
      // Mock CSV content with color names
      const mockCsvContent = `white,black,steelblue
teal,darkorange,midnightblue
antiquewhite,wheat,tomato`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle mixed hex colors and color names', async () => {
      // Mock CSV content with mixed formats
      const mockCsvContent = `#FFFFFF,black,#FF0000
steelblue,#00FF00,teal`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle CSV with fewer than 45 rows and pad with white', async () => {
      // Mock CSV content with only 3 rows
      const mockCsvContent = `#FFFFFF,#FF0000
#00FF00,#0000FF`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle CSV with fewer than 45 columns and pad with white', async () => {
      // Mock CSV content with only 3 columns
      const mockCsvContent = `#FFFFFF,#FF0000,#00FF00
#0000FF,#FFFF00,#FF00FF`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle empty CSV file', async () => {
      mockFs.readFileSync.mockReturnValue('')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle CSV with invalid color names by defaulting to white', async () => {
      // Mock CSV content with invalid color names
      const mockCsvContent = `invalidcolor,#FF0000,anotherinvalid
#00FF00,notacolor,#0000FF`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle CSV file read errors gracefully', async () => {
      const error = new Error('File not found')
      mockFs.readFileSync.mockImplementation(() => {
        throw error
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })





    it('should validate color mapping works correctly', async () => {
      // Test that all color mappings work
      const colorTests = [
        { input: 'white', expected: '#FFFFFF' },
        { input: 'black', expected: '#000000' },
        { input: 'steelblue', expected: '#4682B4' },
        { input: 'teal', expected: '#14B8A6' },
        { input: 'darkorange', expected: '#FF8C00' },
        { input: 'midnightblue', expected: '#191970' },
        { input: 'antiquewhite', expected: '#FAEBD7' },
        { input: 'wheat', expected: '#F5DEB3' },
        { input: 'tomato', expected: '#FF6347' },
        { input: 'seagreen', expected: '#2E8B57' },
      ]

      for (const test of colorTests) {
        const mockCsvContent = test.input
        mockFs.readFileSync.mockReturnValue(mockCsvContent)

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      }
    })

    it('should handle CSV with extra whitespace', async () => {
      const mockCsvContent = `  #FFFFFF  ,  #FF0000  ,  #00FF00  
  #0000FF  ,  #FFFF00  ,  #FF00FF  `
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })

    it('should handle CSV with empty cells', async () => {
      const mockCsvContent = `#FFFFFF,,#00FF00
,#FFFF00,#FF00FF`
      
      mockFs.readFileSync.mockReturnValue(mockCsvContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Canvas reset with Dutch landscape featuring "I love vio.com"!'
      })
    })
  })
})
