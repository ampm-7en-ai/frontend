
import React from 'react';
import { useParams } from 'react-router-dom';

const EditAgent = () => {
  const { agentId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Agent {agentId}</h1>
      <p className="text-gray-600">Agent editing form will be implemented here.</p>
    </div>
  );
};

export default EditAgent;
