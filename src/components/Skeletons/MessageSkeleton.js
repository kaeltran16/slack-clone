import React from 'react';
import { Placeholder } from 'semantic-ui-react';
const MessageSkeleton = () => {
  return (
    <Placeholder>
      <Placeholder.Header image>
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Header>
    </Placeholder>
  );
};

export default MessageSkeleton;
