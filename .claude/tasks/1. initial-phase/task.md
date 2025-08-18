## What & Why
- **Feature/Task:** Create a Reddit Places-like web application where users can collaboratively paint pixels on a shared canvas
- **Problem/Goal:** Build an interactive, real-time collaborative pixel art platform that allows users to paint squares with rate limiting to prevent spam and encourage strategic participation
- **In scope:** 
  - 15x15 grid (225 squares arranged as a larger square) accessible at localhost:3000/play
  - User painting functionality with 20-square initial limit
  - Rate limiting: 1 additional square every 5 seconds after limit reached until reach 20 again
  - Color selector with major colors accessible on the bottom of the screen
  - Mouse navigation between squares
  - space key can paint the currently highlighted square in the selected color
  - SQLite database for persistence in /db directory
  - APIs for fetching live grid state and updating squares
  - Clean, elegant UI with white backgrounds and light grey borders
  - Frontend-only rate limiting logic (no authentication, no localstorage persistence. We'll implement better rate limiting later)
- **Out of scope:** 
  - User authentication/accounts
  - Testing infrastructure
  - ESLint configuration
  - Backend rate limiting validation
  - Complex color palettes beyond major colors

## Interfaces & Dependencies
- **APIs / schemas / migrations:** 
  - GET `/api/canvas` - Fetch current state of all 225 squares (optimized for multiple concurrent users)
  - PUT/PATCH `/api/canvas/[x]/[y]` or POST `/api/canvas` - Update specific square coordinates with color
  - Database schema: `squares` table with columns: id, x_coordinate, y_coordinate, color, last_updated_at
  - Consider indexing on coordinates for fast lookups
  - SQLite database file stored in `/db/canvas.db`
- **Env/Secrets/Flags:** 
  - DATABASE_URL (pointing to SQLite file)
  - Potentially canvas dimensions as env vars for easy configuration

## Success Criteria (Definition of Done)
- [x] User can navigate to localhost:3000/play and see a 15x15 grid (225 squares)
- [x] User can paint squares using space key with selected color
- [x] User can navigate squares with arrow keys with visual highlighting
- [x] User can select colors from a color picker with major colors
- [x] User starts with 20 painting attempts, then gains 1 more every 5 seconds
- [x] Opening in incognito/new browser session resets the limit (JS-based tracking)
- [x] Grid state persists across browser refreshes (stored in SQLite)
- [x] Multiple users can see real-time updates of each other's changes
- [x] Clean, elegant UI with white square backgrounds and light grey borders
- [x] Meets metrics: No specific performance requirements for MVP

## Acceptance Tests (examples)
- **Case 1:** Given a user visits localhost:3000/play, When they click on a white square and select a color, Then the square should change to that color and persist across page refreshes
- **Case 2:** Given a user has painted 20 squares, When they try to paint another square immediately, Then they should be prevented until 5 seconds pass
- **Case 3:** Given one user paints a square, When another user views the canvas, Then they should see the updated square color in real-time
- **Edge cases:** 
  - User clicks rapidly on squares when approaching limit
  - Multiple users paint the same square simultaneously
  - User refreshes page while painting
  - Network interruption during square update
- **Negative cases:** 
  - No authentication system implemented
  - No landing page (direct access to /play only)
  - No API rate limiting enforced
  - No localStorage persistence of limits (intentionally JS memory-based for MVP)

## Examples to Imitate
- Reddit Places (r/place) - Simple grid-based collaborative pixel art
- Focus on clean, minimal UI similar to Reddit Places
- Keyboard navigation patterns (arrow keys for grid navigation)
- Visual feedback for selected/highlighted squares

## Documentation to Use
- Next.js App Router best practices for API routes
- SQLite with better-sqlite3 or similar lightweight Node.js library
- CSS Grid or Flexbox for responsive square layout
- React keyboard event handling for arrow key navigation
- Notes: Prioritize simplicity over complex features - working functionality first

## Other Considerations
- **Real-time updates**: Use polling (every 2-3 seconds) instead of WebSockets for simplicity at this scale
- **Grid dimensions**: Use 15x15 = 225 squares (mathematically cleaner than 200) arranged in a perfect square
- **Square size**: Small squares that form a large zoomable canvas
- **Color palette**: 
  - White
  - Black
  - Ultramarine Blue — #3F51FF
  - Emerald — #10B981
  - Crimson — #DC143C
  - Royal Purple — #6D28D9
  - Teal — #14B8A6
  - Coral — #FF6F61
  - Amber — #FFB300
  - Electric Cyan — #00D9FF
  - Indigo — #4B0082
- **Styling**: Use Tailwind CSS
- **Database**: SQLite
- **Gotchas**: 
  - Clean up default Next.js files first
  - Ensure proper keyboard focus management for arrow key navigation
  - Handle rapid clicking gracefully when approaching rate limits