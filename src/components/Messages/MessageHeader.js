import PropTypes from 'prop-types';
import React from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

const isPlural = number => number.length > 1;

const MessageHeader = ({
                          channelName, numUniqueUsers, handleSearchChange,
                          searchLoading, isPrivateChannel
                       }) => (
  <Segment clearing>
     <Header as='h2' floated='left' style={{ marginBottom: 0 }}>
              <span>
                 {channelName}
                 {!isPrivateChannel && <Icon name='star outline' color='black'/>}
              </span>
        <Header.Subheader>
           {`${numUniqueUsers} user${isPlural(numUniqueUsers) ? 's' : ''}`}
        </Header.Subheader>
     </Header>

     <Header floated='right'>
        <Input loading={searchLoading} size='mini' icon='search' name='searchTerm'
               placeholder='Search Messages' onChange={handleSearchChange}/>
     </Header>
  </Segment>
);

MessageHeader.propTypes = {
   channelName: PropTypes.string.isRequired,
   numUniqueUsers: PropTypes.number.isRequired,
   handleSearchChange: PropTypes.func.isRequired,
   searchLoading: PropTypes.bool.isRequired,
   isPrivateChannel: PropTypes.bool.isRequired
};

export default MessageHeader;
