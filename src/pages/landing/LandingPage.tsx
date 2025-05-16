
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  MessageSquare, 
  Shield, 
  Zap, 
  Settings, 
  Users 
} from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-1/2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Intelligent Conversations for Your Business
              </h1>
              <p className="text-lg mb-8 text-blue-50">
                Connect with your customers through AI-powered conversational agents
                that understand context and deliver value.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                  Start for free <ChevronRight className="ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Book a demo
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/hero-platform.svg" 
                alt="AI Conversation Platform" 
                className="w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-light-gray/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-heading-1 font-bold mb-4">Powerful Features</h2>
            <p className="text-dark-gray max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, train and deploy
              intelligent conversational agents for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="card flex flex-col h-full">
              <div className="p-2 rounded-md bg-accent w-fit mb-4">
                <MessageSquare className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-semibold mb-2">Natural Conversations</h3>
              <p className="text-dark-gray">
                Create agents that engage in natural, contextual conversations with your customers.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="card flex flex-col h-full">
              <div className="p-2 rounded-md bg-accent w-fit mb-4">
                <Shield className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-semibold mb-2">Secure & Compliant</h3>
              <p className="text-dark-gray">
                Enterprise-grade security with data privacy and compliance built-in.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="card flex flex-col h-full">
              <div className="p-2 rounded-md bg-accent w-fit mb-4">
                <Zap className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-semibold mb-2">Instant Deployment</h3>
              <p className="text-dark-gray">
                Deploy your trained agents to multiple channels in minutes, not days.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="card flex flex-col h-full">
              <div className="p-2 rounded-md bg-accent w-fit mb-4">
                <Settings className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-semibold mb-2">Customizable</h3>
              <p className="text-dark-gray">
                Tailor your agents to match your brand voice and business requirements.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="card flex flex-col h-full">
              <div className="p-2 rounded-md bg-accent w-fit mb-4">
                <Users className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-semibold mb-2">Team Collaboration</h3>
              <p className="text-dark-gray">
                Work together with your team to build and improve your agents.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="card flex flex-col h-full">
              <div className="p-2 rounded-md bg-accent w-fit mb-4">
                <MessageSquare className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-semibold mb-2">Multichannel Support</h3>
              <p className="text-dark-gray">
                Deploy your agents to web, mobile, Slack, WhatsApp, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-heading-1 font-bold mb-4">Why Choose Us</h2>
            <p className="text-dark-gray max-w-2xl mx-auto">
              Our platform helps businesses create meaningful conversations with customers,
              improve support efficiency, and drive growth.
            </p>
          </div>

          <div className="flex flex-col gap-16">
            {/* Benefit 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <img
                  src="/benefit-support.svg"
                  alt="24/7 Customer Support"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-heading-2 font-semibold mb-4">24/7 Customer Support</h3>
                <p className="text-dark-gray mb-4">
                  Provide round-the-clock support to your customers without increasing headcount.
                  Our AI agents handle routine inquiries while your team focuses on complex issues.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Reduce response time from hours to seconds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Seamless handoff to human agents when needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Consistent answers across all customer interactions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <img
                  src="/benefit-analytics.svg"
                  alt="Data-Driven Insights"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-heading-2 font-semibold mb-4">Data-Driven Insights</h3>
                <p className="text-dark-gray mb-4">
                  Gain valuable insights from customer conversations to improve your products,
                  services, and overall customer experience.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Detailed analytics on customer questions and pain points</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Identify trends and opportunities for improvement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Measure and improve agent performance over time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-light-gray/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-heading-1 font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-dark-gray max-w-2xl mx-auto">
              Choose the plan that's right for your business. All plans include core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Pricing Card 1 */}
            <div className="card border-2 border-border flex flex-col h-full">
              <div className="p-6">
                <h3 className="text-heading-3 font-semibold mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-dark-gray">/month</span>
                </div>
                <p className="text-dark-gray mb-6">Perfect for small businesses just getting started.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>1 AI Agent</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>5,000 messages/month</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Web integration</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>

            {/* Pricing Card 2 */}
            <div className="card border-2 border-primary flex flex-col h-full relative">
              <div className="absolute -top-4 right-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="p-6">
                <h3 className="text-heading-3 font-semibold mb-2">Professional</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$149</span>
                  <span className="text-dark-gray">/month</span>
                </div>
                <p className="text-dark-gray mb-6">For growing teams that need more capacity.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>3 AI Agents</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>25,000 messages/month</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Web + WhatsApp integration</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Team access (3 members)</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>

            {/* Pricing Card 3 */}
            <div className="card border-2 border-border flex flex-col h-full">
              <div className="p-6">
                <h3 className="text-heading-3 font-semibold mb-2">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <p className="text-dark-gray mb-6">For organizations with advanced needs.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Unlimited AI Agents</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Custom message volume</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>All integrations</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Advanced security features</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    <span>Custom branding</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-heading-1 font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-dark-gray max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {[
                {
                  question: "How does the AI agent work?",
                  answer: "Our AI agents use advanced natural language processing to understand and respond to customer queries in a conversational manner. They can be trained on your specific knowledge base to provide accurate, personalized responses."
                },
                {
                  question: "Can I customize the AI agent to match my brand?",
                  answer: "Yes, you can fully customize the appearance, tone, and personality of your AI agents to align with your brand identity and voice."
                },
                {
                  question: "How long does it take to set up?",
                  answer: "Basic setup can be completed in minutes. For more comprehensive training with your specific knowledge base, it typically takes 1-2 days to get optimal results."
                },
                {
                  question: "What channels can I deploy my agents to?",
                  answer: "Our platform supports deployment to web, mobile apps, WhatsApp, Facebook Messenger, Slack, and more depending on your subscription plan."
                },
                {
                  question: "Is my data secure?",
                  answer: "Yes, we prioritize data security. All data is encrypted both in transit and at rest, and we comply with major security standards and regulations."
                }
              ].map((faq, index) => (
                <div key={index} className="card">
                  <h3 className="text-heading-4 font-semibold mb-2">{faq.question}</h3>
                  <p className="text-dark-gray">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-heading-1 font-bold mb-4">Ready to transform your customer experience?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to create meaningful conversations with their customers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
              Start your free trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Schedule a demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}
