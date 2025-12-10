import { useState } from 'react';
import { MessageSquare, Send, X, Loader } from 'lucide-react';
import Button from './Button';
import Input from './Input';

export default function FeedbackModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    feedback: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send to Telegram bot
      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      
      if (!botToken || !chatId) {
        throw new Error('Telegram configuration missing');
      }

      const message = `🎯 *New Feedback from Digitel*\n\n👤 *Name:* ${formData.name || 'Anonymous'}\n\n💬 *Feedback:*\n${formData.feedback}\n\n⏰ ${new Date().toLocaleString()}`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      setSuccess(true);
      setFormData({ name: '', feedback: '' });
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Feedback error:', err);
      setError('Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Header */}
          <div className="bg-gradient-to-r from-neon-500/10 to-neon-500/5 dark:from-neon-500/20 dark:to-neon-500/10 px-6 py-4 border-b border-gray-200 dark:border-neon-500/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-neon-500/20 p-2 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-neon-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-neon-500">
                  Send Feedback
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-neon-500 transition-colors hover:rotate-90 transform duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {success ? (
              <div className="text-center py-8">
                <div className="bg-neon-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Send className="h-8 w-8 text-neon-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-neon-500 mb-2">
                  Thank you! 🎉
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Your feedback has been sent successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Your Name (Optional)"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                />

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neon-500 mb-2">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleChange}
                    placeholder="Tell us what you think, report a bug, or suggest a feature..."
                    required
                    disabled={loading}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg 
                      bg-white dark:bg-dark-300 
                      text-gray-900 dark:text-gray-100
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:ring-2 focus:ring-neon-500 focus:border-transparent
                      focus:shadow-lg focus:shadow-neon-500/20
                      transition-all duration-300
                      border-gray-300 dark:border-neon-500/30
                      disabled:opacity-60 disabled:cursor-not-allowed
                      resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
