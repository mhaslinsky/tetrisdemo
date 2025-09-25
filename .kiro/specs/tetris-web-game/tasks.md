# Implementation Plan

- [x] 1. Set up project foundation and core types

  - Initialize Next.js project structure with src directory
  - Create TypeScript type definitions for game entities (GameState, Tetromino, Board, Position)
  - Set up Tailwind CSS configuration with Tetris color palette
  - Create basic project structure with components, hooks, lib, and types directories
  - _Requirements: 8.5, 7.1_

- [x] 2. Implement core game constants and utilities

  - Define tetromino shapes with all rotation states in constants file
  - Create board utility functions (createEmptyBoard, isValidPosition, placePiece)
  - Implement basic position and coordinate helper functions
  - Write unit tests for utility functions
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Build collision detection system

  - Implement boundary collision detection (left, right, bottom walls)
  - Create block collision detection for existing pieces on board
  - Add rotation collision detection with wall kick support
  - Write comprehensive unit tests for all collision scenarios
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 4. Create game state management with useReducer

  - Implement GameState interface and initial state
  - Create game action types and reducer function
  - Build useGameState custom hook with state management
  - Add state validation and transition logic
  - Write unit tests for state reducer and transitions
  - _Requirements: 5.1, 5.2, 5.6, 5.7_

- [x] 5. Implement tetromino movement and rotation logic

  - Create functions for piece movement (left, right, down)
  - Implement piece rotation with wall kick algorithms
  - Add hard drop and soft drop functionality
  - Integrate movement logic with collision detection
  - Write unit tests for all movement operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

- [x] 6. Build line clearing and scoring system

  - Implement line detection and clearing algorithm
  - Create scoring calculation functions (single, double, triple, tetris)
  - Add level progression logic based on lines cleared
  - Implement drop scoring (soft drop and hard drop points)
  - Write unit tests for scoring and line clearing logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.4, 4.5_

- [x] 7. Create game loop and timing system

  - Implement useGameLoop hook with requestAnimationFrame
  - Add variable drop speed based on game level
  - Create automatic piece dropping with timing controls
  - Implement pause and resume functionality
  - Write tests for game loop timing and state management
  - _Requirements: 4.1, 4.2, 4.3, 5.3, 5.4, 8.1, 8.2_

- [x] 8. Build keyboard input handling system

  - Create useKeyboardInput hook for key event management
  - Implement key mapping for all game controls
  - Add input debouncing and key repeat handling
  - Integrate input system with game state actions
  - Write tests for input handling and key mapping
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1_

- [x] 9. Create basic game board UI component

  - Build GameBoard component with 10x20 grid rendering
  - Implement block rendering with tetromino colors
  - Add active piece visualization on the board
  - Create responsive grid layout with proper sizing
  - Write component tests for board rendering
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2_

- [x] 10. Implement game sidebar and information display

  - Create GameSidebar component with score, level, and lines display
  - Build NextPiecePreview component for upcoming piece
  - Add HoldPiecePreview component (if hold feature enabled)
  - Implement real-time updates for all game statistics
  - Write component tests for sidebar functionality
  - _Requirements: 1.4, 1.5, 1.6, 7.2_

- [x] 11. Build main game container and orchestration

  - Create GameContainer component as main game coordinator
  - Integrate all hooks (useGameState, useGameLoop, useKeyboardInput)
  - Implement game initialization and cleanup logic
  - Add proper component lifecycle management
  - Write integration tests for game container
  - _Requirements: 5.1, 5.6, 8.3, 8.4_

- [x] 12. Add game over and restart functionality

  - Implement game over detection when pieces can't spawn
  - Create GameOverModal component with final score display
  - Add restart functionality that resets all game state
  - Implement proper game state transitions
  - Write tests for game over scenarios and restart logic
  - _Requirements: 5.5, 5.6, 5.7_

- [x] 13. Implement pause functionality and game controls

  - Add pause/resume game state management
  - Create GameControls component with pause and restart buttons
  - Implement visual pause indicator and game freezing
  - Add keyboard shortcut for pause (spacebar or P key)
  - Write tests for pause functionality and controls
  - _Requirements: 5.3, 5.4, 7.3_

- [x] 14. Add visual effects and animations

  - Implement line clearing animation with CSS transitions
  - Add piece drop animations and visual feedback
  - Create smooth piece movement transitions
  - Add visual indicators for user actions (rotation, movement)
  - Write tests for animation triggers and visual feedback
  - _Requirements: 7.4, 7.5, 8.1_

- [x] 15. Implement accessibility features

  - Add ARIA labels and descriptions for game elements
  - Implement screen reader announcements for game state changes
  - Add keyboard navigation support for all interactive elements
  - Ensure proper focus management throughout the game
  - Write accessibility tests and validate WCAG compliance
  - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6_

- [x] 16. Add responsive design and mobile considerations

  - Implement responsive layout that works on different screen sizes
  - Add touch controls for mobile devices (if requirement 7.7 applies)
  - Optimize component rendering for various device capabilities
  - Ensure game remains playable on smaller screens
  - Write tests for responsive behavior and mobile compatibility
  - _Requirements: 7.7, 8.5_

- [x] 17. Performance optimization and testing

  - Implement React.memo for components that don't need frequent re-renders
  - Add useMemo for expensive calculations (collision detection, scoring)
  - Optimize board rendering to minimize unnecessary updates
  - Implement performance monitoring and frame rate tracking
  - Write performance tests and validate 60fps gameplay
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 18. Create comprehensive test suite

  - Write integration tests for complete game flow scenarios
  - Add end-to-end tests for full game sessions
  - Create performance benchmarks and regression tests
  - Implement accessibility testing with automated tools
  - Add visual regression tests for UI components
  - _Requirements: 8.1, 8.2, 9.1, 9.2, 9.3_

- [x] 19. Final integration and polish
  - Integrate all components into main Next.js page
  - Add error boundaries for graceful error handling
  - Implement final UI polish and visual improvements
  - Add game instructions and help documentation
  - Perform final testing and bug fixes
  - _Requirements: 7.1, 7.6, 8.3, 8.4_
