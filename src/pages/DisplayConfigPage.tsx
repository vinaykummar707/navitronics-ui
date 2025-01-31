import React from 'react';
import DisplayConfigForm from '../components/DisplayConfigForm';

const DisplayConfigPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DisplayConfigForm />
        </div>
      </div>
    </div>
  );
};

export default DisplayConfigPage;
