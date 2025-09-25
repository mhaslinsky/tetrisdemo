import React from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help modal component that displays comprehensive game help and instructions
 */
export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600'>
        <div className='sticky top-0 bg-gray-800 border-b border-gray-600 p-4 flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-white'>Game Help & Instructions</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center'
            aria-label='Close help modal'
          >
            ×
          </button>
        </div>

        <div className='p-6 space-y-8'>
          {/* Quick Start */}
          <section>
            <h3 className='text-xl font-semibold text-white mb-4 flex items-center'>
              <span className='mr-2'>🚀</span>
              Quick Start
            </h3>
            <div className='bg-gray-700 rounded-lg p-4'>
              <ol className='list-decimal list-inside space-y-2 text-gray-300'>
                <li>Use arrow keys to move and rotate falling pieces</li>
                <li>Complete horizontal lines to clear them and score points</li>
                <li>Game speed increases as you clear more lines</li>
                <li>Game ends when pieces reach the top of the board</li>
              </ol>
            </div>
          </section>

          {/* Controls */}
          <section>
            <h3 className='text-xl font-semibold text-white mb-4 flex items-center'>
              <span className='mr-2'>⌨️</span>
              Controls
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-gray-700 rounded-lg p-4'>
                <h4 className='font-semibold text-white mb-3'>Movement</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Move Left:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>←</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Move Right:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>→</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Soft Drop:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>↓</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Hard Drop:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>Space</kbd>
                  </div>
                </div>
              </div>
              <div className='bg-gray-700 rounded-lg p-4'>
                <h4 className='font-semibold text-white mb-3'>Game Controls</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Rotate:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>↑</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Hold Piece:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>C</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Pause:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>P</kbd>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-300'>Restart:</span>
                    <kbd className='px-2 py-1 bg-gray-600 rounded text-xs'>R</kbd>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section>
            <h3 className='text-xl font-semibold text-white mb-4 flex items-center'>
              <span className='mr-2'>🏆</span>
              Scoring System
            </h3>
            <div className='bg-gray-700 rounded-lg p-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-semibold text-white mb-3'>Line Clears</h4>
                  <div className='space-y-2 text-sm'>
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
                  </div>
                </div>
                <div>
                  <h4 className='font-semibold text-white mb-3'>Drop Bonus</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-300'>Soft Drop:</span>
                      <span className='text-gray-400'>1 point per cell</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-300'>Hard Drop:</span>
                      <span className='text-gray-400'>2 points per cell</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Strategy Tips */}
          <section>
            <h3 className='text-xl font-semibold text-white mb-4 flex items-center'>
              <span className='mr-2'>💡</span>
              Strategy Tips
            </h3>
            <div className='bg-gray-700 rounded-lg p-4'>
              <ul className='space-y-2 text-gray-300'>
                <li>• Keep the board as flat as possible to avoid creating holes</li>
                <li>• Save I-pieces (long bars) for clearing multiple lines at once</li>
                <li>• Use the hold feature strategically to save pieces for better opportunities</li>
                <li>• Plan ahead using the next piece preview</li>
                <li>• Clear multiple lines simultaneously for bonus points</li>
                <li>• Use soft drop to maintain control while speeding up placement</li>
                <li>• Learn T-spin techniques for advanced scoring opportunities</li>
              </ul>
            </div>
          </section>

          {/* Accessibility */}
          <section>
            <h3 className='text-xl font-semibold text-white mb-4 flex items-center'>
              <span className='mr-2'>♿</span>
              Accessibility Features
            </h3>
            <div className='bg-gray-700 rounded-lg p-4'>
              <ul className='space-y-2 text-gray-300'>
                <li>• Full keyboard navigation support</li>
                <li>• Screen reader announcements for game state changes</li>
                <li>• High contrast color scheme for better visibility</li>
                <li>• Reduced motion options for users with motion sensitivity</li>
                <li>• Focus indicators for all interactive elements</li>
              </ul>
            </div>
          </section>
        </div>

        <div className='sticky bottom-0 bg-gray-800 border-t border-gray-600 p-4 text-center'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold'
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
