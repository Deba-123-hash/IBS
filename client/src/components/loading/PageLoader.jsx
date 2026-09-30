import React from 'react';
import { Spinner } from '../ui/Spinner.jsx';

export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
      <Spinner size="lg" text={text} />
    </div>
  );
};

export default PageLoader;
