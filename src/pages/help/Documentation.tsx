
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Search, Bookmark, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedTopics, setExpandedTopics] = useState(['introduction']);

  // Sample documentation categories and topics
  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      topics: [
        { id: 'introduction', title: 'Introduction' },
        { id: 'quickstart', title: 'Quick Start Guide' },
        { id: 'installation', title: 'Installation' },
        { id: 'configuration', title: 'Configuration' },
      ],
    },
    {
      id: 'agents',
      name: 'Agent Management',
      topics: [
        { id: 'creating-agents', title: 'Creating Agents' },
        { id: 'configuring-agents', title: 'Configuring Agents' },
        { id: 'agent-templates', title: 'Agent Templates' },
        { id: 'agent-workflows', title: 'Agent Workflows' },
      ],
    },
    {
      id: 'workflows',
      name: 'Workflow Orchestration',
      topics: [
        { id: 'workflow-basics', title: 'Workflow Basics' },
        { id: 'workflow-design', title: 'Workflow Design' },
        { id: 'workflow-execution', title: 'Workflow Execution' },
        { id: 'workflow-monitoring', title: 'Workflow Monitoring' },
      ],
    },
    {
      id: 'integrations',
      name: 'Integrations',
      topics: [
        { id: 'api-integrations', title: 'API Integrations' },
        { id: 'third-party-services', title: 'Third-Party Services' },
        { id: 'data-connectors', title: 'Data Connectors' },
        { id: 'webhooks', title: 'Webhooks' },
      ],
    },
    {
      id: 'compliance',
      name: 'Compliance & Security',
      topics: [
        { id: 'data-privacy', title: 'Data Privacy' },
        { id: 'security-best-practices', title: 'Security Best Practices' },
        { id: 'gdpr-compliance', title: 'GDPR Compliance' },
        { id: 'audit-logs', title: 'Audit Logs' },
      ],
    },
  ];

  // Toggle topic expansion
  const toggleTopic = (topicId: string) => {
    if (expandedTopics.includes(topicId)) {
      setExpandedTopics(expandedTopics.filter(id => id !== topicId));
    } else {
      setExpandedTopics([...expandedTopics, topicId]);
    }
  };

  // Sample article content for the "Introduction" topic
  const introductionContent = `
    <h1>Introduction to 7en.ai</h1>
    <p>Welcome to 7en.ai, a European-compliant multi-agent AI platform that enables businesses to create, manage, and orchestrate collaborative AI agents for complex tasks while maintaining data sovereignty within Europe.</p>
    
    <h2>What is 7en.ai?</h2>
    <p>7en.ai is a comprehensive platform designed to help businesses harness the power of artificial intelligence through collaborative multi-agent systems. It allows you to create specialized AI agents that can work together to accomplish complex tasks, all while ensuring your data remains compliant with European regulations.</p>
    
    <h2>Key Features</h2>
    <ul>
      <li><strong>Multi-Agent Collaboration:</strong> Create specialized AI agents that can work together to solve complex problems.</li>
      <li><strong>European Compliance:</strong> Built from the ground up to adhere to strict European data privacy and sovereignty regulations.</li>
      <li><strong>Workflow Orchestration:</strong> Design, automate, and monitor sophisticated workflows that leverage multiple AI agents.</li>
      <li><strong>Integration Capabilities:</strong> Seamlessly connect with your existing tools and systems through our extensive API and integration options.</li>
      <li><strong>Advanced Security:</strong> Enterprise-grade security measures to protect your sensitive data and AI operations.</li>
    </ul>
    
    <h2>Who is 7en.ai For?</h2>
    <p>7en.ai is designed for organizations of all sizes that want to leverage AI capabilities while maintaining control over their data and ensuring compliance with European regulations. It is particularly valuable for:</p>
    <ul>
      <li>Enterprises with complex workflows that can benefit from AI automation</li>
      <li>Organizations that handle sensitive data and require European data sovereignty</li>
      <li>Businesses looking to implement collaborative AI solutions without extensive technical expertise</li>
      <li>Companies seeking to enhance productivity through intelligently orchestrated AI systems</li>
    </ul>
    
    <h2>Getting Started</h2>
    <p>This documentation will guide you through the process of setting up and using 7en.ai effectively. We recommend starting with the <a href="#quickstart">Quick Start Guide</a> to set up your first agent, and then exploring the more advanced features as you become familiar with the platform.</p>
  `;

  return (
    <MainLayout 
      pageTitle="Documentation"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Help', href: '/help' },
        { label: 'Documentation', href: '/help/documentation' }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search documentation..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8"
                  />
                </div>
              </div>
              
              <nav className="space-y-1">
                {categories.map((category) => (
                  <div key={category.id} className="mb-3">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start font-medium text-sm py-1 ${activeCategory === category.id ? 'bg-secondary' : ''}`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                    
                    {activeCategory === category.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.topics.map((topic) => (
                          <Button
                            key={topic.id}
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start text-sm py-1 ${expandedTopics.includes(topic.id) ? 'font-medium' : 'font-normal text-gray-600'}`}
                            onClick={() => toggleTopic(topic.id)}
                          >
                            <ChevronRight className="h-3 w-3 mr-1" />
                            {topic.title}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end mb-4 space-x-2">
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Bookmark
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: introductionContent }}></div>
              
              <Separator className="my-6" />
              
              <div className="flex flex-col space-y-4">
                <p className="text-sm">Was this article helpful?</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Yes
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Documentation;
