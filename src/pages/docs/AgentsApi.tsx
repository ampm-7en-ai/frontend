
import React from 'react';
import DocsLayout from '@/components/docs/DocsLayout';
import ApiEndpoint from '@/components/docs/ApiEndpoint';

const navigation = [
  {
    title: 'Getting Started',
    href: '/docs',
    children: [
      { title: 'Introduction', href: '/docs/introduction' },
      { title: 'Authentication', href: '/docs/authentication' },
      { title: 'Quick Start', href: '/docs/quickstart' },
    ]
  },
  {
    title: 'API Reference',
    href: '/docs/api',
    children: [
      { title: 'Authentication', href: '/docs/api/auth' },
      { title: 'Agents', href: '/docs/api/agents' },
      { title: 'Knowledge Base', href: '/docs/api/knowledge' },
      { title: 'Conversations', href: '/docs/api/conversations' },
      { title: 'Integrations', href: '/docs/api/integrations' },
    ]
  }
];

const AgentsApi = () => {
  return (
    <DocsLayout navigation={navigation}>
      <div className="col-span-2 space-y-16">
        {/* Get All Agents */}
        <ApiEndpoint
          method="GET"
          endpoint="/api/agents/"
          title="List All Agents"
          description="Retrieve a list of all agents in your organization with their basic information and status."
          parameters={[
            {
              name: 'page',
              type: 'integer',
              required: false,
              description: 'Page number for pagination (default: 1)',
              location: 'query'
            },
            {
              name: 'limit',
              type: 'integer',
              required: false,
              description: 'Number of agents per page (default: 20, max: 100)',
              location: 'query'
            },
            {
              name: 'status',
              type: 'string',
              required: false,
              description: 'Filter by agent status (active, training, inactive)',
              location: 'query'
            }
          ]}
          responses={[
            {
              status: 200,
              description: 'Successfully retrieved agents',
              example: JSON.stringify({
                status: 'success',
                data: {
                  agents: [
                    {
                      id: 1,
                      name: 'Customer Support Bot',
                      description: 'Handles customer inquiries and support tickets',
                      status: 'active',
                      model: 'gpt-4',
                      created_at: '2024-01-15T10:30:00Z',
                      last_trained: '2024-02-01T14:22:00Z',
                      knowledge_sources_count: 15,
                      conversations_count: 1247
                    },
                    {
                      id: 2,
                      name: 'Sales Assistant',
                      description: 'Helps with product information and sales inquiries',
                      status: 'training',
                      model: 'gpt-3.5-turbo',
                      created_at: '2024-01-20T09:15:00Z',
                      last_trained: '2024-02-02T11:45:00Z',
                      knowledge_sources_count: 8,
                      conversations_count: 423
                    }
                  ],
                  pagination: {
                    page: 1,
                    limit: 20,
                    total: 2,
                    total_pages: 1
                  }
                }
              }, null, 2)
            },
            {
              status: 401,
              description: 'Authentication required',
              example: JSON.stringify({
                status: 'error',
                message: 'Authentication credentials were not provided'
              }, null, 2)
            }
          ]}
          examples={{
            curl: `curl -X GET "https://api.7en.ai/api/agents/?page=1&limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
            javascript: `const response = await fetch('https://api.7en.ai/api/agents/?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.agents);`,
            python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.7en.ai/api/agents/?page=1&limit=20', headers=headers)
data = response.json()
print(data['data']['agents'])`
          }}
        />

        {/* Create Agent */}
        <ApiEndpoint
          method="POST"
          endpoint="/api/agents/"
          title="Create New Agent"
          description="Create a new AI agent with specified name, description, and configuration."
          requestBody={{
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the agent (required, max 100 characters)',
                required: true
              },
              description: {
                type: 'string',
                description: 'Description of the agent\'s purpose and capabilities',
                required: true
              },
              model: {
                type: 'string',
                description: 'AI model to use (gpt-4, gpt-3.5-turbo, claude-3-sonnet)',
                required: false
              },
              system_prompt: {
                type: 'string',
                description: 'Custom system prompt for the agent',
                required: false
              },
              temperature: {
                type: 'number',
                description: 'Model temperature (0.0 to 1.0, default: 0.7)',
                required: false
              }
            }
          }}
          responses={[
            {
              status: 201,
              description: 'Agent created successfully',
              example: JSON.stringify({
                status: 'success',
                data: {
                  agent: {
                    id: 3,
                    name: 'Product Expert',
                    description: 'Specialized in product information and technical specifications',
                    status: 'inactive',
                    model: 'gpt-4',
                    system_prompt: 'You are a helpful product expert...',
                    temperature: 0.7,
                    created_at: '2024-02-03T10:30:00Z',
                    knowledge_sources_count: 0,
                    conversations_count: 0
                  }
                },
                message: 'Agent created successfully. Add knowledge sources to start training.'
              }, null, 2)
            },
            {
              status: 400,
              description: 'Invalid request data',
              example: JSON.stringify({
                status: 'error',
                message: 'Validation failed',
                errors: {
                  name: ['This field is required.'],
                  description: ['This field is required.']
                }
              }, null, 2)
            }
          ]}
          examples={{
            curl: `curl -X POST "https://api.7en.ai/api/agents/" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Product Expert",
    "description": "Specialized in product information and technical specifications",
    "model": "gpt-4",
    "temperature": 0.7
  }'`,
            javascript: `const response = await fetch('https://api.7en.ai/api/agents/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Product Expert',
    description: 'Specialized in product information and technical specifications',
    model: 'gpt-4',
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.data.agent);`,
            python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

payload = {
    'name': 'Product Expert',
    'description': 'Specialized in product information and technical specifications',
    'model': 'gpt-4',
    'temperature': 0.7
}

response = requests.post('https://api.7en.ai/api/agents/', json=payload, headers=headers)
data = response.json()
print(data['data']['agent'])`
          }}
        />

        {/* Get Specific Agent */}
        <ApiEndpoint
          method="GET"
          endpoint="/api/agents/{agent_id}/"
          title="Get Agent Details"
          description="Retrieve detailed information about a specific agent including configuration, knowledge sources, and performance metrics."
          parameters={[
            {
              name: 'agent_id',
              type: 'integer',
              required: true,
              description: 'Unique identifier of the agent',
              location: 'path'
            }
          ]}
          responses={[
            {
              status: 200,
              description: 'Agent details retrieved successfully',
              example: JSON.stringify({
                status: 'success',
                data: {
                  agent: {
                    id: 1,
                    name: 'Customer Support Bot',
                    description: 'Handles customer inquiries and support tickets',
                    status: 'active',
                    model: 'gpt-4',
                    system_prompt: 'You are a helpful customer support assistant...',
                    temperature: 0.7,
                    max_tokens: 2048,
                    created_at: '2024-01-15T10:30:00Z',
                    updated_at: '2024-02-01T14:22:00Z',
                    last_trained: '2024-02-01T14:22:00Z',
                    knowledge_sources: [
                      {
                        id: 1,
                        title: 'Product Documentation',
                        type: 'document',
                        status: 'trained',
                        file_count: 15,
                        last_updated: '2024-01-30T09:00:00Z'
                      }
                    ],
                    performance_metrics: {
                      total_conversations: 1247,
                      avg_response_time: 1.2,
                      satisfaction_rating: 4.6,
                      resolution_rate: 0.89
                    }
                  }
                }
              }, null, 2)
            },
            {
              status: 404,
              description: 'Agent not found',
              example: JSON.stringify({
                status: 'error',
                message: 'Agent with ID 999 not found'
              }, null, 2)
            }
          ]}
          examples={{
            curl: `curl -X GET "https://api.7en.ai/api/agents/1/" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
            javascript: `const response = await fetch('https://api.7en.ai/api/agents/1/', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data.agent);`,
            python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.7en.ai/api/agents/1/', headers=headers)
data = response.json()
print(data['data']['agent'])`
          }}
        />
      </div>
    </DocsLayout>
  );
};

export default AgentsApi;
