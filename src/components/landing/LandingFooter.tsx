
import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/logo-icon.svg" alt="7en.ai Logo" className="h-10 mb-4" />
            <p className="text-medium-gray mb-4">
              AI-powered conversational agents for modern businesses.
            </p>
          </div>

          <div>
            <h3 className="text-heading-4 font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-medium-gray hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-medium-gray hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-heading-4 font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Guides</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-heading-4 font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-medium-gray hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-medium-gray text-sm">
            © {new Date().getFullYear()} 7en.ai. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-medium-gray hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-medium-gray hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
