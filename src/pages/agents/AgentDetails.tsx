
import React from 'react';
import { useParams } from 'react-router-dom';

const AgentDetails = () => {
  const { agentId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Details {agentId}</h1>
      <p className="text-gray-600">Agent details will be displayed here.</p>
    </div>
  );
};

export default AgentDetails;
