# Tetris Game Rules and Mechanics

## Core Game Mechanics

### Board Specifications

- **Board Size**: 10 columns × 20 rows (standard Tetris dimensions)
- **Coordinate System**: (0,0) at top-left, (9,19) at bottom-right
- **Block Size**: Each tetromino piece consists of 4 blocks

### Tetromino Pieces

Standard 7 tetromino shapes with their rotations:

1. **I-piece** (Cyan): 4 blocks in a line
2. **O-piece** (Yellow): 2×2 square
3. **T-piece** (Purple): T-shaped
4. **S-piece** (Green): S-shaped
5. **Z-piece** (Red): Z-shaped
6. **J-piece** (Blue): J-shaped
7. **L-piece** (Orange): L-shaped

### Game Rules

#### Piece Movement

- **Left/Right**: Move piece horizontally
- **Down**: Soft drop (faster descent)
- **Rotate**: Clockwise rotation (with wall kicks)
- **Hard Drop**: Instant drop to bottom

#### Line Clearing

- Complete horizontal lines are cleared
- Blocks above cleared lines drop down
- Multiple lines can be cleared simultaneously
- Scoring increases with more lines cleared at once

#### Game Progression

- **Level System**: Increases every 10 lines cleared
- **Speed Increase**: Pieces fall faster at higher levels
- **Scoring**: Points awarded for piece placement and line clears

#### Game Over Conditions

- New piece cannot be placed at spawn position
- Blocks reach the top of the playing field

## Scoring System

### Basic Scoring

- **Single Line**: 100 × level
- **Double Lines**: 300 × level
- **Triple Lines**: 500 × level
- **Tetris (4 lines)**: 800 × level
- **Soft Drop**: 1 point per cell
- **Hard Drop**: 2 points per cell

### Bonus Features

- **T-Spin**: Bonus points for T-piece rotations that clear lines
- **Back-to-Back**: Bonus for consecutive difficult clears

## Technical Implementation Notes

### Collision Detection

- Check boundaries (left, right, bottom walls)
- Check collision with existing blocks
- Implement proper rotation collision (wall kicks)

### Game Loop

- Fixed timestep for consistent gameplay
- Separate render loop from game logic
- Handle input buffering for responsive controls

### State Management

- **Current Piece**: Position, rotation, and type tracking
- **Next Piece**: Preview of upcoming tetromino
- **Hold Piece**: Optional piece holding functionality
- **Game Statistics**: Score, level, lines cleared, and timing
- **Game Status**: Playing, paused, game over states
- **Performance Metrics**: Frame rate and performance tracking

### Input Controls

- **Arrow Keys**: Left/Right movement, Down for soft drop
- **Rotation**: Up arrow or specific rotation keys
- **Hard Drop**: Space bar for instant drop
- **Pause**: P key or spacebar for pause/resume
- **Restart**: R key for game restart
- **Accessibility**: Full keyboard navigation support
