import React from 'react';

const Loader: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-base-200 bg-opacity-75 z-50">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

export default Loader;