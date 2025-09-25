# Project Standards

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 18+
- **Styling**: Tailwind CSS for utility-first styling
- **TypeScript**: Strict mode enabled for type safety
- **State Management**: React hooks (useState, useReducer) for game state
- **Testing**: Jest + React Testing Library

## Code Standards

### File Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── ui/             # Basic UI components
│   └── game/           # Game-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and game logic
├── types/              # TypeScript type definitions
└── constants/          # Game constants and configurations
```

### Naming Conventions

- **Components**: PascalCase (e.g., `GameBoard.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useGameState.ts`)
- **Utilities**: camelCase (e.g., `gameLogic.ts`)
- **Types**: PascalCase with descriptive names (e.g., `GameState`, `TetrominoType`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BOARD_WIDTH`, `TETROMINO_SHAPES`)

### Component Structure

- Use functional components with TypeScript
- Implement proper prop types and interfaces
- Use React.memo() for performance optimization where needed
- Keep components focused and single-responsibility

### Game Logic Principles

- Separate game logic from UI components
- Use immutable state updates
- Implement pure functions for game calculations
- Handle side effects properly with useEffect

## Development Practices

### Testing Strategy

- **Unit Tests**: Game logic functions, utility functions, and individual components
- **Integration Tests**: Complete game flow scenarios and component interactions
- **End-to-End Tests**: Full game sessions and user workflows
- **Performance Tests**: Frame rate validation and performance benchmarks
- **Accessibility Tests**: WCAG compliance and screen reader compatibility
- **Visual Regression Tests**: UI consistency across different states
- **Test Infrastructure**: Comprehensive test runner and report generation

### Performance Considerations

- **Rendering Optimization**: React.memo and useMemo for expensive calculations
- **Animation Performance**: requestAnimationFrame for 60fps gameplay
- **State Management**: Minimize re-renders during game loop
- **Collision Detection**: Efficient algorithms for real-time gameplay
- **Performance Monitoring**: Frame rate tracking and performance metrics
- **Memory Management**: Proper cleanup and resource management

### Accessibility

- **Keyboard Navigation**: Full keyboard control for all game functions
- **Screen Reader Support**: ARIA labels and live announcements for game state
- **Focus Management**: Proper focus handling for interactive elements
- **Visual Accessibility**: High contrast support and clear visual indicators
- **Responsive Design**: Mobile-friendly layouts and touch controls
- **WCAG Compliance**: Adherence to accessibility standards and guidelines

## Development Tools

### Testing Infrastructure

- **Test Runner**: Custom test runner with comprehensive reporting
- **Test Categories**: Organized tests by type (unit, integration, e2e, performance, accessibility, visual)
- **Coverage Reports**: Detailed test coverage analysis and reporting
- **Automated Testing**: CI/CD integration for continuous testing

### Performance Monitoring

- **Frame Rate Tracking**: Real-time FPS monitoring during gameplay
- **Performance Metrics**: Memory usage and rendering performance analysis
- **Benchmarking**: Performance regression testing and optimization validation

### Development Utilities

- **Custom Hooks**: Specialized hooks for game state, input handling, and accessibility
- **Utility Libraries**: Reusable functions for game logic, collision detection, and scoring
- **Type Safety**: Comprehensive TypeScript definitions for all game entities
