import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/80 dark:bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-dark-400 rounded-lg text-left overflow-hidden shadow-2xl shadow-neon-500/20 border border-gray-200 dark:border-neon-500/30 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slideUp">
          <div className="bg-white dark:bg-dark-400 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-neon-500">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-neon-500 transition-colors hover:rotate-90 transform duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
