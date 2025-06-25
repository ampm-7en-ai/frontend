
import React from 'react';
import { useParams } from 'react-router-dom';

const AgentTraining = () => {
  const { agentId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Training {agentId}</h1>
      <p className="text-gray-600">Agent training interface will be implemented here.</p>
    </div>
  );
};

export default AgentTraining;
