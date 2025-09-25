# Tetris Web Game

A modern, fully-featured Tetris game built with Next.js, React, and TypeScript. This implementation follows classic Tetris gameplay mechanics while incorporating modern web technologies and accessibility features.

## Features

### Core Gameplay

- **Classic Tetris Mechanics**: 7 standard tetromino pieces with proper rotation and movement
- **Line Clearing**: Complete horizontal lines to clear them and score points
- **Progressive Difficulty**: Game speed increases every 10 lines cleared
- **Scoring System**: Points awarded for line clears, soft drops, and hard drops
- **Hold Functionality**: Save pieces for strategic placement
- **Next Piece Preview**: Plan ahead with upcoming piece visibility

### Modern Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Touch Controls**: Mobile-friendly touch interface
- **Smooth Animations**: 60fps gameplay with CSS animations
- **Visual Effects**: Line clearing animations and visual feedback
- **Error Boundaries**: Graceful error handling and recovery
- **Performance Optimized**: Efficient rendering and memory management

### Accessibility

- **Full Keyboard Navigation**: Complete game control via keyboard
- **Screen Reader Support**: Announcements for game state changes
- **High Contrast**: Optimized color scheme for visibility
- **Focus Management**: Proper focus indicators and navigation
- **Reduced Motion**: Options for users with motion sensitivity

### User Experience

- **Game Statistics**: Track games played, high scores, and total lines cleared
- **Help System**: Comprehensive in-game help and instructions
- **Pause/Resume**: Full game state preservation
- **Fullscreen Mode**: F11 for immersive gameplay
- **Loading States**: Smooth loading experience

## Controls

### Movement

- **←** Move piece left
- **→** Move piece right
- **↓** Soft drop (faster descent)
- **Space** Hard drop (instant drop)

### Game Actions

- **↑** Rotate piece clockwise
- **C** Hold current piece
- **P** Pause/resume game
- **R** Restart game

### Global Shortcuts

- **F1** or **Ctrl+H** Show help modal
- **F11** Toggle fullscreen mode
- **Escape** Close help modal

## Scoring System

### Line Clears

- **Single Line**: 100 × Level points
- **Double Lines**: 300 × Level points
- **Triple Lines**: 500 × Level points
- **Tetris (4 Lines)**: 800 × Level points

### Drop Bonuses

- **Soft Drop**: 1 point per cell
- **Hard Drop**: 2 points per cell

## Technical Implementation

### Architecture

- **Next.js 14**: App Router with React Server Components
- **TypeScript**: Strict type checking for reliability
- **Tailwind CSS**: Utility-first styling with custom animations
- **React Hooks**: Custom hooks for game state and logic
- **Performance Monitoring**: Built-in performance tracking

### Game Logic

- **Immutable State**: Predictable state updates with useReducer
- **Collision Detection**: Comprehensive boundary and block collision
- **Wall Kicks**: Standard rotation system with wall kick support
- **Game Loop**: RequestAnimationFrame-based timing system

### Testing

- **Unit Tests**: Comprehensive test coverage for game logic
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full game session testing
- **Accessibility Tests**: WCAG compliance validation
- **Performance Tests**: Frame rate and memory monitoring

## Development

### Getting Started

```bash
npm install
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:comprehensive` - Run all tests including E2E

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── game/           # Game-specific components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Game logic and utilities
├── types/              # TypeScript type definitions
└── constants/          # Game constants and configurations
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, RequestAnimationFrame

## Performance

- **60fps Gameplay**: Consistent frame rates during active play
- **Memory Efficient**: Optimized for extended play sessions
- **Fast Loading**: Optimized bundle size and loading strategies
- **Responsive**: <16ms input latency for smooth controls

## Accessibility Compliance

- **WCAG 2.1 AA**: Meets accessibility guidelines
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Readers**: Comprehensive announcements and descriptions
- **Color Contrast**: Sufficient contrast ratios for visibility
- **Focus Management**: Clear focus indicators and logical tab order

## License

This project is built for educational and demonstration purposes. The Tetris game concept is owned by The Tetris Company.

## Contributing

This is a demonstration project showcasing modern web development practices for building interactive games with React and Next.js.
