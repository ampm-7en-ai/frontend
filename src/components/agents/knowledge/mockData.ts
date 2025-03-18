import { SourceType, SourceOption, KnowledgeSource } from './types';

export const mockSourceOptions: Record<SourceType, SourceOption[]> = {
  document: [
    { id: 201, name: 'Product Manual.pdf', type: 'pdf', size: '5.2 MB', lastUpdated: '2024-02-15', description: 'Complete product specifications and usage guidelines' },
    { id: 202, name: 'Onboarding Guide.docx', type: 'docx', size: '1.8 MB', lastUpdated: '2024-01-22', description: 'New customer onboarding process documentation' },
    { id: 203, name: 'Technical Whitepaper.pdf', type: 'pdf', size: '3.5 MB', lastUpdated: '2024-03-10', description: 'In-depth technical explanations of our solution' }
  ],
  url: [
    { id: 301, name: 'Company Blog', type: 'url', size: 'N/A', lastUpdated: '2024-03-15', url: 'https://blog.example.com' },
    { id: 302, name: 'Knowledge Base', type: 'url', size: 'N/A', lastUpdated: '2024-03-12', url: 'https://support.example.com' },
    { id: 303, name: 'Developer Documentation', type: 'url', size: 'N/A', lastUpdated: '2024-02-28', url: 'https://developers.example.com' }
  ],
  database: [
    { id: 401, name: 'Customer Database', type: 'database', size: '45 MB', lastUpdated: '2024-03-18', description: 'Customer information and engagement history' },
    { id: 402, name: 'Product Catalog', type: 'database', size: '28 MB', lastUpdated: '2024-03-17', description: 'Complete product catalog with specifications' }
  ],
  csv: [
    { id: 501, name: 'Sales Reports Q1.csv', type: 'csv', size: '1.2 MB', lastUpdated: '2024-03-15', description: 'Q1 sales data by region and product line' },
    { id: 502, name: 'Customer Survey Results.csv', type: 'csv', size: '0.8 MB', lastUpdated: '2024-02-22', description: 'Results from our annual customer satisfaction survey' }
  ],
  plainText: [
    { id: 601, name: 'Company FAQ', type: 'plainText', size: '12 KB', lastUpdated: '2024-03-10', description: 'Frequently asked questions and answers' },
    { id: 602, name: 'Release Notes', type: 'plainText', size: '45 KB', lastUpdated: '2024-03-05', description: 'Latest product release notes and updates' }
  ],
  thirdParty: [
    { id: 701, name: 'Google Drive Integration', type: 'thirdParty', size: 'N/A', lastUpdated: '2024-03-18', description: 'Connected Google Drive documents' },
    { id: 702, name: 'Dropbox Files', type: 'thirdParty', size: 'N/A', lastUpdated: '2024-03-17', description: 'Synced Dropbox files' }
  ]
};

export const mockKnowledgeSources: KnowledgeSource[] = [
  {
    id: 1,
    name: 'Product Manual.pdf',
    type: 'document',
    size: '5.2 MB',
    lastUpdated: '2024-02-15',
    trainingStatus: 'idle',
    progress: 0
  },
  {
    id: 2,
    name: 'Knowledge Base',
    type: 'url',
    size: 'N/A',
    lastUpdated: '2024-03-12',
    trainingStatus: 'success',
    progress: 100,
    url: 'https://support.example.com'
  }
];
