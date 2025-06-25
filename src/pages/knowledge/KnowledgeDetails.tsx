
import React from 'react';
import { useParams } from 'react-router-dom';

const KnowledgeDetails = () => {
  const { knowledgeId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Knowledge Details {knowledgeId}</h1>
      <p className="text-gray-600">Knowledge source details will be displayed here.</p>
    </div>
  );
};

export default KnowledgeDetails;
