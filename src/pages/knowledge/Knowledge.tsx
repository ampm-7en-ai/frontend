
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Knowledge = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <Link to="/knowledge/upload">
          <Button>Add Knowledge Source</Button>
        </Link>
      </div>
      <p className="text-gray-600">Knowledge base management will be implemented here.</p>
    </div>
  );
};

export default Knowledge;
