
import React from 'react';
import { useParams } from 'react-router-dom';

const AgentBilling = () => {
  const { agentId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Billing {agentId}</h1>
      <p className="text-gray-600">Agent billing information will be displayed here.</p>
    </div>
  );
};

export default AgentBilling;
