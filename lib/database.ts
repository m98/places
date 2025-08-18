import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db', 'canvas.db');
const db = new Database(dbPath);

// Create squares table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS squares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x_coordinate INTEGER NOT NULL,
    y_coordinate INTEGER NOT NULL,
    color TEXT NOT NULL,
    last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(x_coordinate, y_coordinate)
  )
`);

// Create index for fast coordinate lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_coordinates ON squares(x_coordinate, y_coordinate)
`);

// Initialize all squares with white color if table is empty or expand to 45x45
const count = db.prepare('SELECT COUNT(*) as count FROM squares').get() as { count: number };
const maxCoord = db.prepare('SELECT MAX(x_coordinate) as max_x, MAX(y_coordinate) as max_y FROM squares').get() as { max_x: number, max_y: number };

// If table is empty or still using old 15x15 grid, initialize/expand to 45x45
if (count.count === 0 || (maxCoord.max_x !== null && maxCoord.max_x < 44)) {
  const insertSquare = db.prepare(`
    INSERT OR IGNORE INTO squares (x_coordinate, y_coordinate, color) 
    VALUES (?, ?, ?)
  `);
  
  for (let x = 0; x < 45; x++) {
    for (let y = 0; y < 45; y++) {
      insertSquare.run(x, y, '#FFFFFF');
    }
  }
}

export interface Square {
  x_coordinate: number;
  y_coordinate: number;
  color: string;
  last_updated_at: string;
}

export const getAllSquares = () => {
  const stmt = db.prepare('SELECT x_coordinate, y_coordinate, color, last_updated_at FROM squares ORDER BY x_coordinate, y_coordinate');
  return stmt.all() as Square[];
};

export const updateSquare = (x: number, y: number, color: string) => {
  const stmt = db.prepare(`
    UPDATE squares 
    SET color = ?, last_updated_at = CURRENT_TIMESTAMP 
    WHERE x_coordinate = ? AND y_coordinate = ?
  `);
  return stmt.run(color, x, y);
};

export default db;