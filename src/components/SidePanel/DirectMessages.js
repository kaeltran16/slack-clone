import React from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import firebase from '../../firebase';

class DirectMessages extends React.Component {
   state = {
      activeChannel: '',
      users: [],
      userRef: firebase.database()
         .ref('users'),
      connectedRef: firebase.database()
         .ref('.info/connected'),
      presenceRef: firebase.database()
         .ref('presences')
   };

   addListeners = id => {
      const loadedUsers = [];
      const { userRef, connectedRef, presenceRef } = this.state;
      userRef.on('child_added', snap => {
         if (id !== snap.key) {
            let user = snap.val();

            user.uid = snap.key;
            user.status = 'offline';
            loadedUsers.push(user);
            this.setState({ users: loadedUsers });
         }
      });

      connectedRef.on('value', snap => {
         if (snap.val()) {
            const ref = presenceRef.child(id);
            ref.set(true)
               .catch(err => console.log(err));
            ref.onDisconnect()
               .remove()
               .catch(err => console.log(err));
         }
      });

      presenceRef.on('child_added', snap => {
         if (id !== snap.key) {
            this.addStatusToUser(snap.key);
         }
      });

      presenceRef.on('child_removed', snap => {
         if (id !== snap.key) {
            this.addStatusToUser(snap.key, false);
         }
      });

   };

   removeListeners = () => {
      this.state.userRef.off();
      this.state.presenceRef.off();
      this.state.connectedRef.off();
   };

   addStatusToUser = (id, connected = true) => {
      const { users } = this.state;
      const updatedUser = users.reduce((acc, user) => {
         if (user.uid === id) {
            user.status = `${connected ? 'online' : 'offline'}`;
         }
         return acc.concat(user);
      }, []);
      this.setState({ users: updatedUser });
   };

   isUserOnline = user => user.status === 'online';

   changeChannel = user => {
      const channelId = this.getChannelId(user.uid);
      const channelData = {
         id: channelId,
         name: user.name
      };
      const { setCurrentChannel, setPrivateChannel } = this.props;
      setCurrentChannel(channelData);
      setPrivateChannel(true);
      this.setActiveChannel(user.uid);
   };

   getChannelId = userId => {
      const { user } = this.props;
      const currentUserId = user.uid;
      return userId < currentUserId ? `${userId}/${currentUserId}`
         : `${currentUserId}/${userId}`;
   };

   setActiveChannel = userId => {
      this.setState({ activeChannel: userId });
   };

   componentDidMount() {
      const { user } = this.props;
      if (user) {
         this.addListeners(user.uid);
      }
   }

   componentWillUnmount() {
      this.removeListeners();
   }

   render() {
      const { users, activeChannel } = this.state;
      return (
         <Menu.Menu className={'menu'}>
            <Menu.Item>
               <span>
                  <Icon name={'mail'} />DIRECT MESSAGES
              </span>{' '}({users.length})
           </Menu.Item>
            {users.map(user => (
               <Menu.Item active={user.uid === activeChannel} key={user.uid}
                  onClick={() => this.changeChannel(user)} style={{
                     opacity: 0.7,
                     fontStyle: 'italic'
                  }}>
                  <Icon name={'circle'} color={this.isUserOnline(user) ? 'green' : 'red'} />
                  @ {user.name}
               </Menu.Item>
            ))}
         </Menu.Menu>
      );
   }
}

const mapStateToProps = state => ({
   user: state.user.currentUser
});

export default connect(mapStateToProps, {
   setCurrentChannel,
   setPrivateChannel
})(DirectMessages);
