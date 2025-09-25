import React, { useState } from "react";

interface GameInstructionsProps {
  className?: string;
}

/**
 * Game instructions and help documentation component
 * Provides comprehensive information about game controls, scoring, and rules
 */
export const GameInstructions: React.FC<GameInstructionsProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-600 ${className}`}>
      <button
        onClick={toggleExpanded}
        className='w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors rounded-lg'
        aria-expanded={isExpanded}
        aria-controls='game-instructions-content'
      >
        <span className='text-lg font-semibold text-white'>Game Instructions</span>
        <span className={`text-gray-400 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isExpanded && (
        <div id='game-instructions-content' className='px-4 pb-4'>
          <div className='space-y-6 text-sm'>
            {/* Controls Section */}
            <section>
              <h3 className='text-white font-semibold mb-3 text-base'>Controls</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Move Left:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>←</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Move Right:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>→</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Soft Drop:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>↓</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Rotate:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>↑</kbd>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Hard Drop:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>Space</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Hold Piece:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>C</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Pause:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>P</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Restart:</span>
                    <kbd className='px-2 py-1 bg-gray-700 rounded text-xs'>R</kbd>
                  </div>
                </div>
              </div>
            </section>

            {/* Scoring Section */}
            <section>
              <h3 className='text-white font-semibold mb-3 text-base'>Scoring</h3>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Single Line:</span>
                  <span className='text-blue-400'>100 × Level</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Double Lines:</span>
                  <span className='text-green-400'>300 × Level</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Triple Lines:</span>
                  <span className='text-yellow-400'>500 × Level</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Tetris (4 Lines):</span>
                  <span className='text-purple-400'>800 × Level</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Soft Drop:</span>
                  <span className='text-gray-400'>1 point per cell</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Hard Drop:</span>
                  <span className='text-gray-400'>2 points per cell</span>
                </div>
              </div>
            </section>

            {/* Game Rules Section */}
            <section>
              <h3 className='text-white font-semibold mb-3 text-base'>Game Rules</h3>
              <ul className='space-y-2 text-gray-300'>
                <li>• Complete horizontal lines to clear them and score points</li>
                <li>• Cleared lines cause blocks above to drop down</li>
                <li>• Game speed increases every 10 lines cleared</li>
                <li>• Use the hold feature to save a piece for later</li>
                <li>• Game ends when pieces reach the top of the board</li>
                <li>• Try to clear multiple lines at once for bonus points</li>
              </ul>
            </section>

            {/* Tetromino Pieces Section */}
            <section>
              <h3 className='text-white font-semibold mb-3 text-base'>Tetromino Pieces</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                <div className='text-center'>
                  <div className='text-cyan-400 text-lg mb-1'>I</div>
                  <div className='text-xs text-gray-400'>Line Piece</div>
                </div>
                <div className='text-center'>
                  <div className='text-yellow-400 text-lg mb-1'>O</div>
                  <div className='text-xs text-gray-400'>Square</div>
                </div>
                <div className='text-center'>
                  <div className='text-purple-400 text-lg mb-1'>T</div>
                  <div className='text-xs text-gray-400'>T-Shape</div>
                </div>
                <div className='text-center'>
                  <div className='text-green-400 text-lg mb-1'>S</div>
                  <div className='text-xs text-gray-400'>S-Shape</div>
                </div>
                <div className='text-center'>
                  <div className='text-red-400 text-lg mb-1'>Z</div>
                  <div className='text-xs text-gray-400'>Z-Shape</div>
                </div>
                <div className='text-center'>
                  <div className='text-blue-400 text-lg mb-1'>J</div>
                  <div className='text-xs text-gray-400'>J-Shape</div>
                </div>
                <div className='text-center'>
                  <div className='text-orange-400 text-lg mb-1'>L</div>
                  <div className='text-xs text-gray-400'>L-Shape</div>
                </div>
              </div>
            </section>

            {/* Tips Section */}
            <section>
              <h3 className='text-white font-semibold mb-3 text-base'>Pro Tips</h3>
              <ul className='space-y-2 text-gray-300'>
                <li>• Plan ahead using the next piece preview</li>
                <li>• Keep the board as flat as possible</li>
                <li>• Save long I-pieces for Tetris opportunities</li>
                <li>• Use soft drop to maintain control while speeding up</li>
                <li>• Practice T-spins for advanced scoring</li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInstructions;
