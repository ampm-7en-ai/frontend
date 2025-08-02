
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  title: string;
  description: string;
  parameters?: Parameter[];
  requestBody?: RequestBodySchema;
  responses: Response[];
  examples: {
    curl: string;
    javascript: string;
    python?: string;
  };
  authentication?: boolean;
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: 'path' | 'query' | 'header';
}

interface RequestBodySchema {
  type: string;
  properties: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
}

interface Response {
  status: number;
  description: string;
  example: string;
}

const ApiEndpoint = ({ 
  method, 
  endpoint, 
  title, 
  description, 
  parameters = [], 
  requestBody,
  responses, 
  examples,
  authentication = true 
}: ApiEndpointProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500';
      case 'POST': return 'bg-green-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      case 'PATCH': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Left Column - Documentation */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Badge className={`${getMethodColor(method)} text-white`}>
              {method}
            </Badge>
            <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint}</code>
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
          
          {authentication && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm">
                🔐 <strong>Authentication required:</strong> This endpoint requires a valid API key or Bearer token.
              </p>
            </div>
          )}
        </div>

        {parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Parameters</h3>
            <div className="space-y-3">
              {parameters.map((param) => (
                <Card key={param.name} className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{param.name}</code>
                    <Badge variant={param.required ? 'default' : 'outline'}>
                      {param.required ? 'Required' : 'Optional'}
                    </Badge>
                    <Badge variant="secondary">{param.location}</Badge>
                    <span className="text-sm text-muted-foreground">{param.type}</span>
                  </div>
                  <p className="text-sm">{param.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {requestBody && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Request Body</h3>
            <Card className="p-4">
              <div className="space-y-3">
                {Object.entries(requestBody.properties).map(([key, prop]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
                    <Badge variant={prop.required ? 'default' : 'outline'}>
                      {prop.required ? 'Required' : 'Optional'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{prop.type}</span>
                    <span className="text-sm">- {prop.description}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Responses</h3>
          <div className="space-y-3">
            {responses.map((response) => (
              <Card key={response.status} className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={response.status < 300 ? 'default' : 'destructive'}>
                    {response.status}
                  </Badge>
                  <span className="text-sm font-medium">{response.description}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Code Examples */}
      <div className="space-y-6">
        <Card className="p-0">
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl" className="p-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyToClipboard(examples.curl, 'curl')}
                >
                  {copiedCode === 'curl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{examples.curl}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="javascript" className="p-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyToClipboard(examples.javascript, 'javascript')}
                >
                  {copiedCode === 'javascript' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{examples.javascript}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="python" className="p-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyToClipboard(examples.python || '', 'python')}
                >
                  {copiedCode === 'python' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{examples.python || '# Python example coming soon'}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Response Examples */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Response Examples</h4>
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.status}>
                <Badge variant={response.status < 300 ? 'default' : 'destructive'} className="mb-2">
                  {response.status} {response.description}
                </Badge>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  <code>{response.example}</code>
                </pre>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default ApiEndpoint;
