import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import Spinner from '../../Spinner';
import MessageForm from './MessageForm';
import MessageHeader from './MessageHeader';
import MessageItem from './MessageItem';

class Messages extends React.Component {
   static defaultProps = {
      currentChannel: null
   };

   static propTypes = {
      currentChannel: PropTypes.object,
      currentUser: PropTypes.object.isRequired
   };

   state = {
      messageRef: firebase.database()
        .ref('messages'),
      privateMessagesRef: firebase.database()
        .ref('privateMessages'),
      messageLoading: true,
      loadedMessages: [],
      numUniqueUsers: 0,
      searchTerm: '',
      searchLoading: false,
      searchResults: []
   };

   componentDidUpdate(prevProps) {
      const { currentChannel, currentUser } = this.props;
      if (currentChannel !== prevProps.currentChannel) {
         if (currentUser && currentChannel) {
            this.addListeners(currentChannel.id);
         }
      }
   }

   handleSearchMessages = () => {
      const { loadedMessages, searchTerm } = this.state;
      const channelMessages = [...loadedMessages];
      const regex = new RegExp(searchTerm, 'gi');
      const searchResults = channelMessages.reduce((acc, message) => {
         if (message.content && message.content.match(regex)) {
            acc.push(message);
         }
         return acc;
      }, []);
      this.setState({ searchResults });
      setTimeout(() => this.setState({ searchLoading: false }), 500);
   };

   countUniqueUsers = messages => {
      const uniqueUsers = messages.reduce((acc, message) => {
         if (!acc.includes(message.user.name)) {
            acc.push(message.user.name);
         }
         return acc;
      }, []);
      this.setState({ numUniqueUsers: uniqueUsers.length });
   };

   displayMessages = messages => messages.length > 0 && messages.map(message => {
      const { currentUser } = this.props;
      return (
        <MessageItem key={message.timestamp}
                     message={message} user={currentUser}/>
      );
   });

   displayChannelName = channel => {
      const { isPrivateChannel } = this.props;

      return (channel ? `${isPrivateChannel ? '@' : '#'}${channel.name}` : '');
   };

   addListeners = channelId => this.addMessageListener(channelId);

   addMessageListener = channelId => {
      const loadedMessages = [];
      const ref = this.getMessagesRef();
      ref.child(channelId)
        .on('child_added', snap => {
           loadedMessages.push(snap.val());
           this.countUniqueUsers(loadedMessages);
        });
      this.setState({
         loadedMessages,
         messageLoading: false
      });
   };

   getMessagesRef = () => {
      const { messageRef, privateMessagesRef } = this.state;
      const { isPrivateChannel } = this.props;
      return isPrivateChannel ? privateMessagesRef : messageRef;
   };

   handleSearchChange = event => {
      this.setState({
         searchTerm: event.target.value,
         searchLoading: true
      }, () => {
         this.handleSearchMessages();
      });
   };

   render() {
      const {
         loadedMessages, numUniqueUsers, messageLoading, searchTerm,
         searchResults, searchLoading
      } = this.state;
      const { currentChannel, isPrivateChannel } = this.props;
      return (
        <React.Fragment>
           <MessageHeader channelName={this.displayChannelName(currentChannel)}
                          numUniqueUsers={numUniqueUsers} searchLoading={searchLoading}
                          isPrivateChannel={isPrivateChannel}
                          handleSearchChange={this.handleSearchChange}/>

           <Segment>
              <Comment.Group className='messages'>
                 {messageLoading
                   ? <Spinner/> : searchTerm ? this.displayMessages(searchResults)
                     : this.displayMessages(loadedMessages)}
              </Comment.Group>
           </Segment>
           <MessageForm getMessagesRef={this.getMessagesRef}/>
        </React.Fragment>
      );
   }
}

const mapStateToProps = state => ({
   currentUser: state.user.currentUser,
   currentChannel: state.channel.currentChannel,
   isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(Messages);
