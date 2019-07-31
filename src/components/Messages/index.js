import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessageForm from './MessageForm';
import MessageHeader from './MessageHeader';
import MessageItem from './MessageItem';
import { setUserPosts } from '../../actions';
import Typing from './Typing';
import { MessageSkeleton } from '../Skeletons';
class Messages extends React.Component {
  static defaultProps = {
    currentChannel: null
  };

  static propTypes = {
    currentChannel: PropTypes.object,
    currentUser: PropTypes.object.isRequired
  };

  state = {
    messageRef: firebase.database().ref('messages'),
    privateMessagesRef: firebase.database().ref('privateMessages'),
    usersRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    connectedRef: firebase.database().ref('.info/connected'),
    messageLoading: true,
    loadedMessages: [],
    numUniqueUsers: 0,
    isChannelStarred: false,
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingUsers: [],
    listeners: []
  };

  componentDidUpdate(prevProps) {
    const { currentChannel, currentUser } = this.props;
    if (currentChannel !== prevProps.currentChannel) {
      if (currentUser && currentChannel) {
        this.removeListeners(this.state.listeners);
        this.addListeners(currentChannel.id);
        this.addUserStarsListener(currentChannel.id, currentUser.uid);
      }
    }
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
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

  addUserStarsListener = (channelId, userId) => {
    const { usersRef } = this.state;
    usersRef
      .child(userId)
      .child('starred')
      .once('value')
      .then(data => {
        if (data.val()) {
          const channelIds = Object.keys(data.val());
          const isPreviouslyStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: isPreviouslyStarred });
        }
      });
  };

  addToListeners = (id, ref, event) => {
    const { listeners } = this.state;
    const index = listeners.findIndex(
      listener =>
        listener.id === id && listener.ref === ref && listener.event === event
    );

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: listeners.concat(newListener) });
    }
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

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => {
      const { currentUser } = this.props;
      return (
        <MessageItem
          key={message.timestamp}
          message={message}
          user={currentUser}
        />
      );
    });

  displayChannelName = channel => {
    const { isPrivateChannel } = this.props;

    return channel ? `${isPrivateChannel ? '@' : '#'}${channel.name}` : '';
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListeners(channelId);
  };

  removeListeners = listeners => {
    if (listeners) {
      listeners.forEach(listener => {
        listener.ref.child(listener.id).off(listener.event);
      });
    }
  };

  addTypingListeners = channelId => {
    let typingUsers = [];
    const { typingRef, connectedRef } = this.state;
    const { currentUser } = this.props;
    typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== currentUser.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, typingRef, 'child_added');

    typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);

      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, typingRef, 'child_removed');

    connectedRef.on('value', snap => {
      if (snap.val()) {
        typingRef
          .child(channelId)
          .child(currentUser.uid)
          .onDisconnect()
          .remove(err => {
            if (err) {
              console.log(err);
            }
          });
      }
    });
  };

  addMessageListener = channelId => {
    const loadedMessages = [];
    const ref = this.getMessagesRef();
    ref
      .child(channelId)
      .once('value')
      .then(snap => {
        this.setState({
          loadedMessages,
          messageLoading: false
        });
      });

    this.addToListeners(channelId, ref, 'value');
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.countUniqueUsers(loadedMessages);
      this.setState({
        loadedMessages
      });
      this.countUserPosts(loadedMessages);
    });

    this.addToListeners(channelId, ref, 'child_added');
  };

  getMessagesRef = () => {
    const { messageRef, privateMessagesRef } = this.state;
    const { isPrivateChannel } = this.props;
    return isPrivateChannel ? privateMessagesRef : messageRef;
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});

    this.props.setUserPosts(userPosts);
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => {
        this.handleSearchMessages();
      }
    );
  };

  handleStarring = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => {
        this.starChannel();
      }
    );
  };

  starChannel = () => {
    const { isChannelStarred, usersRef } = this.state;
    const { currentUser, currentChannel } = this.props;
    if (isChannelStarred) {
      console.log('starred');
      console.log(currentChannel);
      usersRef.child(`${currentUser.uid}/starred`).update({
        [currentChannel.id]: {
          name: currentChannel.name,
          detail: currentChannel.detail,
          createdBy: {
            name: currentChannel.createdBy.name,
            avatar: currentChannel.createdBy.avatar
          }
        }
      });
    } else {
      usersRef.child(`${currentUser.uid}/starred`).remove(err => {
        if (!err) {
          console.log(`cannot unStarred channel due to ${err}`);
        }
      });
    }
  };

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(user => (
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '.2em' }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span>
        <Typing />
      </div>
    ));

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  displayMessageSkeleton = () => (
    <React.Fragment>
      {[...Array(10)].map((el, index) => (
        <MessageSkeleton key={index} />
      ))}
    </React.Fragment>
  );

  render() {
    const {
      loadedMessages,
      numUniqueUsers,
      messageLoading,
      searchTerm,
      searchResults,
      searchLoading,
      isChannelStarred,
      typingUsers
    } = this.state;
    const { currentChannel, isPrivateChannel } = this.props;
    return (
      <React.Fragment>
        <MessageHeader
          channelName={this.displayChannelName(currentChannel)}
          numUniqueUsers={numUniqueUsers}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
          handleSearchChange={this.handleSearchChange}
          handleStarring={this.handleStarring}
          isChannelStarred={isChannelStarred}
        />

        <Segment>
          <Comment.Group className="messages">
            {messageLoading
              ? this.displayMessageSkeleton()
              : searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(loadedMessages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)} />
          </Comment.Group>
        </Segment>
        <MessageForm getMessagesRef={this.getMessagesRef} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(
  mapStateToProps,
  { setUserPosts }
)(Messages);
