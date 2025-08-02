
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Code, Zap, BookOpen } from 'lucide-react';

const QuickStartGuide = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Quick Start Guide</h1>
        <p className="text-xl text-muted-foreground">
          Get up and running with the 7en.ai API in minutes
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Get Your API Key</h3>
            <Badge variant="secondary">
              <Zap className="w-3 h-3 mr-1" />
              2 minutes
            </Badge>
          </div>
          <div className="ml-11 space-y-4">
            <p className="text-muted-foreground">
              Sign up for a 7en.ai account and generate your API key from the dashboard.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Navigate to:</p>
              <p className="text-sm">Dashboard → Settings → API Keys → Generate New Key</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm">
                🔑 <strong>Important:</strong> Store your API key securely. It won't be shown again after creation.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">Create Your First Agent</h3>
            <Badge variant="secondary">
              <Code className="w-3 h-3 mr-1" />
              5 minutes
            </Badge>
          </div>
          <div className="ml-11 space-y-4">
            <p className="text-muted-foreground">
              Create an AI agent that can handle your specific use case.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{`curl -X POST "https://api.7en.ai/api/agents/" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First Agent",
    "description": "A helpful customer support agent",
    "model": "gpt-4"
  }'`}</code>
              </pre>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">Add Knowledge Sources</h3>
            <Badge variant="secondary">
              <BookOpen className="w-3 h-3 mr-1" />
              10 minutes
            </Badge>
          </div>
          <div className="ml-11 space-y-4">
            <p className="text-muted-foreground">
              Upload documents, PDFs, or connect data sources to train your agent.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Upload a document
const formData = new FormData();
formData.append('agent_id', '1');
formData.append('title', 'Product Manual');
formData.append('file', file);

fetch('https://api.7en.ai/api/knowledgesource/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});`}</code>
              </pre>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-xl font-semibold">Start a Conversation</h3>
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready!
            </Badge>
          </div>
          <div className="ml-11 space-y-4">
            <p className="text-muted-foreground">
              Begin chatting with your agent via WebSocket or REST API.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Start a chat session
const response = await fetch('https://api.7en.ai/api/chat/sessions/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 1,
    message: 'Hello! How can you help me today?'
  })
});`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <h3 className="text-xl font-semibold mb-4">🚀 What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Explore Advanced Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Set up webhooks for real-time notifications</li>
              <li>• Integrate with CRM systems</li>
              <li>• Configure custom system prompts</li>
              <li>• Monitor agent performance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Integration Examples</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• React/JavaScript SDK</li>
              <li>• Python SDK</li>
              <li>• Zapier integration</li>
              <li>• Slack bot setup</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickStartGuide;
