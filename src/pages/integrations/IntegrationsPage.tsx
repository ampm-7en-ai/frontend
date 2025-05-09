
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsAppIntegration from '@/components/integrations/WhatsAppIntegration';
import SlackIntegration from '@/components/integrations/SlackIntegration';
import InstagramIntegration from '@/components/integrations/InstagramIntegration';
import MessengerIntegration from '@/components/integrations/MessengerIntegration';
import ZapierIntegration from '@/components/integrations/ZapierIntegration';
import { MessageSquare, Slack, Instagram, Link, Phone } from 'lucide-react';

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState("whatsapp");

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'whatsapp':
        return <Phone className="h-5 w-5 mr-2" />;
      case 'slack':
        return <Slack className="h-5 w-5 mr-2" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 mr-2" />;
      case 'messenger':
        return <MessageSquare className="h-5 w-5 mr-2" />;
      case 'zapier':
        return <Link className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'whatsapp':
        return "WhatsApp Business";
      case 'slack':
        return "Slack";
      case 'instagram':
        return "Instagram";
      case 'messenger':
        return "Facebook Messenger";
      case 'zapier':
        return "Zapier";
      default:
        return "";
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'whatsapp':
        return "Connect your chatbot with WhatsApp Business API to reach your customers where they are.";
      case 'slack':
        return "Connect your chatbot with Slack to engage with your team and customers.";
      case 'instagram':
        return "Connect your chatbot with Instagram to respond to DMs automatically.";
      case 'messenger':
        return "Connect your chatbot with Facebook Messenger to automate customer conversations.";
      case 'zapier':
        return "Connect your chatbot with thousands of apps through Zapier automation.";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your 7en.ai chatbot to various messaging platforms and services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div
          className={`p-4 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
            activeTab === 'whatsapp' 
              ? 'bg-green-100 border-2 border-green-300 shadow-md' 
              : 'bg-white border border-gray-200 hover:border-green-200 hover:bg-green-50'
          }`}
          onClick={() => setActiveTab('whatsapp')}
        >
          <div className={`p-3 rounded-full ${activeTab === 'whatsapp' ? 'bg-green-200' : 'bg-gray-100'}`}>
            <Phone className={`h-6 w-6 ${activeTab === 'whatsapp' ? 'text-green-700' : 'text-gray-600'}`} />
          </div>
          <span className={activeTab === 'whatsapp' ? 'font-medium text-green-800' : 'text-gray-700'}>WhatsApp</span>
        </div>

        <div
          className={`p-4 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
            activeTab === 'slack' 
              ? 'bg-indigo-100 border-2 border-indigo-300 shadow-md' 
              : 'bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('slack')}
        >
          <div className={`p-3 rounded-full ${activeTab === 'slack' ? 'bg-indigo-200' : 'bg-gray-100'}`}>
            <Slack className={`h-6 w-6 ${activeTab === 'slack' ? 'text-indigo-700' : 'text-gray-600'}`} />
          </div>
          <span className={activeTab === 'slack' ? 'font-medium text-indigo-800' : 'text-gray-700'}>Slack</span>
        </div>

        <div
          className={`p-4 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
            activeTab === 'instagram' 
              ? 'bg-purple-100 border-2 border-purple-300 shadow-md' 
              : 'bg-white border border-gray-200 hover:border-purple-200 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('instagram')}
        >
          <div className={`p-3 rounded-full ${activeTab === 'instagram' ? 'bg-purple-200' : 'bg-gray-100'}`}>
            <Instagram className={`h-6 w-6 ${activeTab === 'instagram' ? 'text-purple-700' : 'text-gray-600'}`} />
          </div>
          <span className={activeTab === 'instagram' ? 'font-medium text-purple-800' : 'text-gray-700'}>Instagram</span>
        </div>

        <div
          className={`p-4 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
            activeTab === 'messenger' 
              ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
              : 'bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
          }`}
          onClick={() => setActiveTab('messenger')}
        >
          <div className={`p-3 rounded-full ${activeTab === 'messenger' ? 'bg-blue-200' : 'bg-gray-100'}`}>
            <MessageSquare className={`h-6 w-6 ${activeTab === 'messenger' ? 'text-blue-700' : 'text-gray-600'}`} />
          </div>
          <span className={activeTab === 'messenger' ? 'font-medium text-blue-800' : 'text-gray-700'}>Messenger</span>
        </div>

        <div
          className={`p-4 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
            activeTab === 'zapier' 
              ? 'bg-orange-100 border-2 border-orange-300 shadow-md' 
              : 'bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50'
          }`}
          onClick={() => setActiveTab('zapier')}
        >
          <div className={`p-3 rounded-full ${activeTab === 'zapier' ? 'bg-orange-200' : 'bg-gray-100'}`}>
            <Link className={`h-6 w-6 ${activeTab === 'zapier' ? 'text-orange-700' : 'text-gray-600'}`} />
          </div>
          <span className={activeTab === 'zapier' ? 'font-medium text-orange-800' : 'text-gray-700'}>Zapier</span>
        </div>
      </div>

      <Card className="border shadow-lg">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex items-center">
            {getTabIcon(activeTab)}
            <div>
              <CardTitle>{getTabTitle(activeTab)}</CardTitle>
              <CardDescription>
                {getTabDescription(activeTab)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {activeTab === 'whatsapp' && <WhatsAppIntegration />}
          {activeTab === 'slack' && <SlackIntegration />}
          {activeTab === 'instagram' && <InstagramIntegration />}
          {activeTab === 'messenger' && <MessengerIntegration />}
          {activeTab === 'zapier' && <ZapierIntegration />}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;
