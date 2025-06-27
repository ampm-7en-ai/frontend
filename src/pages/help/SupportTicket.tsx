
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, MessageSquare, BookOpen, Headphones } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import SearchModal from '@/components/help/SearchModal';

const SupportTicket = () => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-12 max-w-6xl px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Help & Support</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Get the help you need to make the most of 7en</p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input 
                className="pl-12 pr-16 py-4 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl text-lg"
                placeholder="Ask anything..."
              />
              <ModernButton 
                variant="primary" 
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                icon={ArrowRight}
                onClick={() => setIsSearchModalOpen(true)}
              >
                Ask AI
              </ModernButton>
            </div>
          </div>
        </div>
        
        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {/* Discord Support */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ask the Community</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Get instant help from 7en users on Discord.
            </p>
            <ModernButton variant="outline" size="sm" icon={ArrowRight}>
              Join Discord
            </ModernButton>
          </div>
          
          {/* Documentation */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">7en Academy</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Learn how to use 7en with our documentation, expert tips, and tutorials.
            </p>
            <ModernButton variant="outline" size="sm" icon={ArrowRight}>
              View Docs
            </ModernButton>
          </div>
          
          {/* Premium Support */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Premium Support</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Direct support channel, for paying users.
            </p>
            <ModernButton variant="gradient" size="sm" icon={ArrowRight}>
              Get Support
            </ModernButton>
          </div>
        </div>
        
        {/* Get Involved Section */}
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Get involved</h2>
            <p className="text-slate-600 dark:text-slate-400">Join our community and help shape the future of 7en</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Changelog */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Product Changelog</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                News from the 7en engineering team.
              </p>
              <ModernButton variant="outline" size="sm" icon={ArrowRight}>
                7en Changelog
              </ModernButton>
            </div>
            
            {/* Feature Requests */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Feature requests</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Have an idea? Share it and let the community vote!
              </p>
              <ModernButton variant="outline" size="sm" icon={ArrowRight}>
                7en Feedback
              </ModernButton>
            </div>
            
            {/* Partner Program */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Partner program</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Join our partner program to access exclusive benefits.
              </p>
              <ModernButton variant="outline" size="sm" icon={ArrowRight}>
                Learn more
              </ModernButton>
            </div>
            
            {/* Affiliate Program */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Affiliate program</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Earn commission by referring new customers to 7en.
              </p>
              <ModernButton variant="outline" size="sm" icon={ArrowRight}>
                Join program
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </div>
  );
};

export default SupportTicket;
