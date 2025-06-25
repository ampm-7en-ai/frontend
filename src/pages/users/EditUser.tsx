
import React from 'react';
import { useParams } from 'react-router-dom';

const EditUser = () => {
  const { userId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit User {userId}</h1>
      <p className="text-gray-600">User editing form will be implemented here.</p>
    </div>
  );
};

export default EditUser;
