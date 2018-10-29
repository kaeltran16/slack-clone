import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ uploadState, percentage }) => (
  uploadState === 'uploading' && (
    <Progress className={'progress__bar'} percent={percentage}
              progress indicating size={'medium'}
              inverted/>
  )
);

export default ProgressBar;
