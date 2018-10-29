import React from 'react';
import { connect } from 'react-redux';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessageForm from './MessageForm';
import MessageHeader from './MessageHeader';
import MessageItem from './MessageItem';

class Messages extends React.Component {
   state = {
      messages: firebase.database()
        .ref('messages'),
      messageLoading: true,
      loadedMessages: []
   };
   addListeners = channelId => {
      this.addMessageListener(channelId);
   };
   addMessageListener = channelId => {
      console.log('here');
      const loadedMessages = [];
      this.state.messages.child(channelId)
        .on('child_added', snap => {
           loadedMessages.push(snap.val());
           this.setState({
              loadedMessages,
              messageLoading: false
           });
        });
   };
   displayMessages = messages => {
      return messages.length > 0 && messages.map(message =>
        <MessageItem key={message.timestamp}
                     message={message} user={this.props.currentUser}/>);
   };

   componentDidUpdate(prevProps) {
      if (this.props.currentChannel !== prevProps.currentChannel) {
         const { currentUser, currentChannel } = this.props;
         console.log(currentChannel);
         console.log(currentUser);
         if (currentUser && currentChannel) {
            this.addListeners(currentChannel.id);
         }
      }
   }

   render() {
      const { messages, loadedMessages } = this.state;
      const { currentUser, currentChannel } = this.props;
      return (
        <React.Fragment>
           <MessageHeader/>

           <Segment>
              <Comment.Group className='messages'>
                 {this.displayMessages(loadedMessages)}
              </Comment.Group>
           </Segment>

           <MessageForm messages={messages} currentUser={currentUser}
                        currentChannel={currentChannel}/>
        </React.Fragment>
      );
   }
}

const mapStateToProps = state => ({
   currentUser: state.user.currentUser,
   currentChannel: state.channel.currentChannel
});

export default connect(mapStateToProps)(Messages);
