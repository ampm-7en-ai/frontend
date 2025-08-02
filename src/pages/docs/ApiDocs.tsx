
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
  },
  {
    title: 'Webhooks',
    href: '/docs/webhooks'
  },
  {
    title: 'SDKs',
    href: '/docs/sdks',
    children: [
      { title: 'JavaScript', href: '/docs/sdks/javascript' },
      { title: 'Python', href: '/docs/sdks/python' },
    ]
  }
];

const ApiDocs = () => {
  return (
    <DocsLayout navigation={navigation}>
      <ApiEndpoint
        method="POST"
        endpoint="/api/users/login/"
        title="User Login"
        description="Authenticate a user with username and password to receive access and refresh tokens."
        parameters={[
          {
            name: 'username',
            type: 'string',
            required: true,
            description: 'The user\'s username or email address',
            location: 'query'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'The user\'s password',
            location: 'query'
          }
        ]}
        requestBody={{
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'User\'s username or email',
              required: true
            },
            password: {
              type: 'string',
              description: 'User\'s password',
              required: true
            }
          }
        }}
        responses={[
          {
            status: 200,
            description: 'Login successful',
            example: JSON.stringify({
              status: 'success',
              data: {
                accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                refreshToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                user: {
                  id: 1,
                  username: 'john@example.com',
                  email: 'john@example.com',
                  firstName: 'John',
                  lastName: 'Doe'
                }
              }
            }, null, 2)
          },
          {
            status: 401,
            description: 'Invalid credentials',
            example: JSON.stringify({
              status: 'error',
              message: 'Invalid username or password'
            }, null, 2)
          }
        ]}
        examples={{
          curl: `curl -X POST "https://api.7en.ai/api/users/login/" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "john@example.com",
    "password": "your_password"
  }'`,
          javascript: `const response = await fetch('https://api.7en.ai/api/users/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john@example.com',
    password: 'your_password'
  })
});

const data = await response.json();
console.log(data);`,
          python: `import requests

url = "https://api.7en.ai/api/users/login/"
payload = {
    "username": "john@example.com",
    "password": "your_password"
}

response = requests.post(url, json=payload)
data = response.json()
print(data)`
        }}
        authentication={false}
      />
    </DocsLayout>
  );
};

export default ApiDocs;
