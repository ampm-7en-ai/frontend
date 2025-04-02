
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, MessageSquare, BookOpen, Headphones } from 'lucide-react';

const SupportTicket = () => {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-4xl font-bold text-center mb-8">Help & Support</h1>
      
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-16">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="pl-10 pr-12 py-6 bg-background border border-input rounded-lg"
            placeholder="Ask anything..."
          />
          <Button size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <ArrowRight />
          </Button>
        </div>
      </div>
      
      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {/* Discord Support */}
        <Card className="bg-background hover:bg-accent/10 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ask the Community</h2>
            <p className="text-muted-foreground">
              Get instant help from Lovable users on Discord.
            </p>
          </CardContent>
        </Card>
        
        {/* Documentation */}
        <Card className="bg-background hover:bg-accent/10 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Lovable Academy</h2>
            <p className="text-muted-foreground">
              Learn how to use Lovable with our documentation, expert tips, and tutorials.
            </p>
          </CardContent>
        </Card>
        
        {/* Premium Support */}
        <Card className="bg-background hover:bg-accent/10 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4">
              <Headphones className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Premium Support</h2>
            <p className="text-muted-foreground">
              Direct support channel, for paying users.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Get Involved Section */}
      <h2 className="text-3xl font-bold text-center mb-16">Get involved</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
        {/* Changelog */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Product Changelog</h3>
          <p className="text-muted-foreground mb-4">
            News from the Lovable engineering team.
          </p>
          <Button variant="outline" className="flex items-center">
            Lovable Changelog <ArrowRight className="ml-2" />
          </Button>
        </div>
        
        {/* Feature Requests */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Feature requests</h3>
          <p className="text-muted-foreground mb-4">
            Have an idea? Share it and let the community vote!
          </p>
          <Button variant="outline" className="flex items-center">
            Lovable Feedback <ArrowRight className="ml-2" />
          </Button>
        </div>
        
        {/* Partner Program */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Partner program</h3>
          <p className="text-muted-foreground mb-4">
            Join our partner program to access exclusive benefits.
          </p>
          <Button variant="outline" className="flex items-center">
            Learn more <ArrowRight className="ml-2" />
          </Button>
        </div>
        
        {/* Affiliate Program */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Affiliate program</h3>
          <p className="text-muted-foreground mb-4">
            Earn commission by referring new customers to Lovable.
          </p>
          <Button variant="outline" className="flex items-center">
            Join program <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;
