import { Link } from 'react-router-dom';
import { Rocket, Zap, Shield, Globe, Link2 } from 'lucide-react';
import Button from '../components/Button';
import FeedbackButton from '../components/FeedbackButton';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-500 dark:to-dark-400">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fadeIn">
            Deploy Your Frontend
            <span className="text-neon-500"> Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-fadeIn">
            The simplest way to deploy your React, Vue, or any static site. 
            Get your custom subdomain in seconds.
          </p>
          <Link to="/login">
            <Button size="lg" className="px-8 animate-fadeIn">
              Get Started for Free
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-white dark:bg-dark-300 p-6 rounded-xl shadow-md hover:shadow-2xl hover:shadow-neon-500/20 transition-all hover:scale-105 border border-transparent dark:border-neon-500/30">
            <div className="flex justify-center mb-4">
              <div className="bg-neon-500/10 dark:bg-neon-500/20 p-3 rounded-full">
                <Zap className="h-8 w-8 text-neon-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-500 mb-2 text-center">
              Lightning Fast
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Deploy your site in seconds. Upload your build folder and go live instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-300 p-6 rounded-xl shadow-md hover:shadow-2xl hover:shadow-neon-500/20 transition-all hover:scale-105 border border-transparent dark:border-neon-500/30">
            <div className="flex justify-center mb-4">
              <div className="bg-neon-500/10 dark:bg-neon-500/20 p-3 rounded-full">
                <Globe className="h-8 w-8 text-neon-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-500 mb-2 text-center">
              Custom Subdomains
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Get your own subdomain like yourname.digitel.site with SSL included.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-300 p-6 rounded-xl shadow-md hover:shadow-2xl hover:shadow-neon-500/20 transition-all hover:scale-105 border border-transparent dark:border-neon-500/30">
            <div className="flex justify-center mb-4">
              <div className="bg-neon-500/10 dark:bg-neon-500/20 p-3 rounded-full">
                <Link2 className="h-8 w-8 text-neon-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-500 mb-2 text-center">
              Backend Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Connect your frontend to any backend API. Proxy requests seamlessly without CORS issues.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-300 p-6 rounded-xl shadow-md hover:shadow-2xl hover:shadow-neon-500/20 transition-all hover:scale-105 border border-transparent dark:border-neon-500/30">
            <div className="flex justify-center mb-4">
              <div className="bg-neon-500/10 dark:bg-neon-500/20 p-3 rounded-full">
                <Shield className="h-8 w-8 text-neon-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-500 mb-2 text-center">
              Secure & Reliable
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              HTTPS enabled by default. Your site is secure and always online.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-dark-400 py-16 border-y border-gray-200 dark:border-neon-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-neon-500 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-neon-500 text-dark-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-neon-500/50 animate-pulse">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-neon-500">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">Create your account with email or GitHub</p>
            </div>
            <div className="text-center">
              <div className="bg-neon-500 text-dark-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-neon-500/50 animate-pulse">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-neon-500">Upload Build</h3>
              <p className="text-gray-600 dark:text-gray-300">Upload your dist or build folder</p>
            </div>
            <div className="text-center">
              <div className="bg-neon-500 text-dark-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-neon-500/50 animate-pulse">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-neon-500">Go Live</h3>
              <p className="text-gray-600 dark:text-gray-300">Your site is live at yourname.digitel.site</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-neon-500 dark:bg-dark-300 dark:border-t dark:border-neon-500/30">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-500 dark:text-neon-500 mb-4">
            Ready to Deploy?
          </h2>
          <p className="text-xl text-dark-500/80 dark:text-gray-300 mb-8">
            Join developers who trust Digitel for their frontend hosting
          </p>
          <Link to="/login">
            <Button variant="outline" size="lg" className="bg-dark-500 text-neon-500 hover:bg-dark-400 border-dark-500 dark:border-neon-500 dark:shadow-lg dark:shadow-neon-500/50">
              Start Deploying Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  );
}
