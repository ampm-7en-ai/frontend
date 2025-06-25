
import React from 'react';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
  const { userId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Details {userId}</h1>
      <p className="text-gray-600">User details will be displayed here.</p>
    </div>
  );
};

export default UserDetails;
