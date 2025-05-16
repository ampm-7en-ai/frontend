
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

type LandingHeaderProps = {
  transparent?: boolean;
};

export const LandingHeader = ({ transparent = false }: LandingHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // App domain for redirects
  const appDomain = "https://app.7en.ai";

  return (
    <header className={`w-full ${transparent ? 'absolute top-0 left-0 z-10' : 'border-b border-border'}`}>
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="7en.ai Logo" className="h-8" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
            Benefits
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </a>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <a href={`${appDomain}/login`}>
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </a>
          <a href={`${appDomain}/register`}>
            <Button size="sm">Get Started</Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-border shadow-md z-20 py-4 md:hidden">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#benefits" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a 
                href="#pricing" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col gap-3 pt-3 border-t border-border">
                <a href={`${appDomain}/login`}>
                  <Button variant="outline" className="w-full" size="sm">
                    Log in
                  </Button>
                </a>
                <a href={`${appDomain}/register`}>
                  <Button className="w-full" size="sm">
                    Get Started
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
