import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { StateGraph } from './StateGraph';
import type { StateGraphProps } from './StateGraph';

export const StateGraphWrapper: React.FC<StateGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <StateGraph {...props} />
    </ReactFlowProvider>
  );
};

export default StateGraphWrapper;
