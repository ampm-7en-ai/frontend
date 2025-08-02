
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ApiDocs from './ApiDocs';
import AgentsApi from './AgentsApi';
import QuickStartGuide from '@/components/docs/QuickStartGuide';
import DocsLayout from '@/components/docs/DocsLayout';

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

const Documentation = () => {
  return (
    <Routes>
      <Route path="/" element={<ApiDocs />} />
      <Route path="/quickstart" element={
        <DocsLayout navigation={navigation}>
          <div className="col-span-2">
            <QuickStartGuide />
          </div>
        </DocsLayout>
      } />
      <Route path="/api/agents" element={<AgentsApi />} />
      <Route path="/api/auth" element={<ApiDocs />} />
    </Routes>
  );
};

export default Documentation;
