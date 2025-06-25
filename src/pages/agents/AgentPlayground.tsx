
import React from 'react';
import { useParams } from 'react-router-dom';

const AgentPlayground = () => {
  const { agentId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Playground {agentId}</h1>
      <p className="text-gray-600">Agent playground will be implemented here.</p>
    </div>
  );
};

export default AgentPlayground;
