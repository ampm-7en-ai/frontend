
import { useState } from 'react';

// Mock data - in a real app, you would fetch this from an API
export const useConversations = () => {
  const [conversations] = useState([
    {
      id: 'conv1',
      customer: 'John Doe',
      email: 'john.doe@example.com',
      lastMessage: 'I need help with setting up my account',
      time: '2 hours ago',
      status: 'active',
      agent: 'Sales Bot',
      satisfaction: 'high',
      priority: 'normal',
      duration: '2h 15m',
      handoffCount: 0,
      topic: 'Account Setup',
      messages: [
        { id: 'm1', content: 'Hello, I need help with setting up my account.', sender: 'user', timestamp: '2 hours ago' },
        { id: 'm2', content: 'Hi John! I\'d be happy to help you set up your account. Can you tell me what specific step you\'re having trouble with?', sender: 'bot', timestamp: '2 hours ago', agent: 'Sales Bot' },
        { id: 'm3', content: 'I\'m stuck at the verification step. It says my email is invalid.', sender: 'user', timestamp: '1 hour 58m ago' },
        { id: 'm4', content: 'I understand the frustration. Let me check your account details. Can you confirm the email you used for registration?', sender: 'bot', timestamp: '1 hour 57m ago', agent: 'Sales Bot' },
        { id: 'm5', content: 'I used john.doe@example.com', sender: 'user', timestamp: '1 hour 55m ago' },
        { id: 'm6', content: 'Thank you. I\'ve checked and there seems to be a verification issue. I\'ll send a new verification link to your email right away.', sender: 'bot', timestamp: '1 hour 54m ago', agent: 'Sales Bot' },
      ]
    },
    {
      id: 'conv2',
      customer: 'Michael Brown',
      email: 'michael.b@example.com',
      lastMessage: 'I\'m still experiencing the same issue after talking to 3 different agents',
      time: '5 minutes ago',
      status: 'pending',
      agent: 'Senior Support Agent',
      satisfaction: 'low',
      priority: 'high',
      duration: '3h 30m',
      handoffCount: 3,
      topic: 'Billing Issue',
      messages: [
        { id: 'm1', content: 'Hello, I need help with my subscription. I was charged twice this month.', sender: 'user', timestamp: '3 hours ago' },
        { id: 'm2', content: 'Hi Michael! I\'m the General Bot. I understand you\'re having billing concerns. Let me check your account details.', sender: 'bot', timestamp: '3 hours ago', agent: 'General Bot' },
        { id: 'm3', content: 'I can see two charges on your account from our system. Let me transfer you to our Technical Support Bot who can better assist with this issue.', sender: 'bot', timestamp: '2 hours 55m ago', agent: 'General Bot' },
        { id: 'transfer1', type: 'transfer', from: 'General Bot', to: 'Technical Support Bot', reason: 'Technical expertise needed for billing investigation', timestamp: '2 hours 50m ago' },
        { id: 'm4', content: 'Hello Michael, I\'m the Technical Support Bot. I\'ve reviewed your account and can see the duplicate charge. This appears to be a system glitch.', sender: 'bot', timestamp: '2 hours 45m ago', agent: 'Technical Support Bot' },
        { id: 'm5', content: 'Can you please help me get a refund for the duplicate charge?', sender: 'user', timestamp: '2 hours 40m ago' },
        { id: 'm6', content: 'I\'ll need to check if this requires approval from our billing department. Let me transfer you to a Billing Specialist who can process the refund for you.', sender: 'bot', timestamp: '2 hours 35m ago', agent: 'Technical Support Bot' },
        { id: 'transfer2', type: 'transfer', from: 'Technical Support Bot', to: 'Billing Specialist', reason: 'Refund authorization required', timestamp: '2 hours 30m ago' },
        { id: 'm7', content: 'Hello Michael, I\'m Sam from the Billing team. I\'m looking at your account now.', sender: 'bot', timestamp: '2 hours 25m ago', agent: 'Billing Specialist' },
        { id: 'm8', content: 'I see the duplicate charge, but our system shows this might be for two different subscription tiers. Are you using multiple features of our platform?', sender: 'bot', timestamp: '2 hours 20m ago', agent: 'Billing Specialist' },
        { id: 'm9', content: 'No, I only have one account and one subscription. I should only be charged once per month according to my plan.', sender: 'user', timestamp: '2 hours 15m ago' },
        { id: 'm10', content: 'I understand. This seems more complex than I initially thought. Let me transfer you to one of our Senior Support Agents who has higher authorization levels to resolve this.', sender: 'bot', timestamp: '2 hours 10m ago', agent: 'Billing Specialist' },
        { id: 'transfer3', type: 'transfer', from: 'Billing Specialist', to: 'Senior Support Agent', reason: 'Complex billing issue requiring senior authorization', timestamp: '2 hours 5m ago' },
        { id: 'm11', content: 'Hi Michael, I\'m Alex, a Senior Support Agent. I apologize for all the transfers. I\'m reviewing your entire case history now.', sender: 'bot', timestamp: '2 hours ago', agent: 'Senior Support Agent' },
        { id: 'm12', content: 'I can confirm there is indeed a duplicate charge. I\'ll need to check with our finance department about why this happened and how to prevent it in the future.', sender: 'bot', timestamp: '1 hour 55m ago', agent: 'Senior Support Agent' },
        { id: 'm13', content: 'So will I get my refund today? This has been very frustrating to deal with.', sender: 'user', timestamp: '1 hour 50m ago' },
        { id: 'm14', content: 'I understand your frustration, Michael. I\'ve submitted the refund request, but it typically takes 3-5 business days to process. I\'ll mark this as urgent, but I cannot guarantee it will be processed today.', sender: 'bot', timestamp: '1 hour 45m ago', agent: 'Senior Support Agent' },
        { id: 'm15', content: 'I\'m still experiencing the same issue after talking to 3 different agents. All I want is my money back for a service I didn\'t sign up for twice.', sender: 'user', timestamp: '5 minutes ago' },
      ]
    },
    {
      id: 'conv3',
      customer: 'Jane Smith',
      email: 'jane.smith@example.com',
      lastMessage: 'Can you tell me more about your pricing plans?',
      time: '3 hours ago',
      status: 'closed',
      agent: 'Support Bot',
      satisfaction: 'medium',
      priority: 'normal',
      duration: '45m',
      handoffCount: 1,
      topic: 'Pricing Plans',
      messages: []
    },
    {
      id: 'conv4',
      customer: 'Robert Johnson',
      email: 'robert.j@example.com',
      lastMessage: 'Thank you for your help!',
      time: '1 day ago',
      status: 'closed',
      agent: 'Sales Bot',
      satisfaction: 'high',
      priority: 'normal',
      duration: '32m',
      handoffCount: 0,
      topic: 'General Inquiry',
      messages: []
    },
    {
      id: 'conv5',
      customer: 'Emily Williams',
      email: 'emily.w@example.com',
      lastMessage: 'I\'m still experiencing the same issue',
      time: '4 hours ago',
      status: 'active',
      agent: 'Support Bot',
      satisfaction: 'low',
      priority: 'high',
      duration: '4h 22m',
      handoffCount: 2,
      topic: 'Technical Support',
      messages: []
    },
  ]);

  return { conversations };
};
