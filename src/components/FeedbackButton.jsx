import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-neon-500 text-dark-500 p-4 rounded-full shadow-lg shadow-neon-500/50 hover:shadow-2xl hover:shadow-neon-500/70 hover:scale-110 transition-all duration-300 z-40 animate-pulse"
        aria-label="Send Feedback"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <FeedbackModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
