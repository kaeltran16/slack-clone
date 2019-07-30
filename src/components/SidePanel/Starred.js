import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import firebase from '../../firebase';
class Starred extends React.Component {
  state = {
    starredChannels: [],
    activeChannel: '',
    usersRef: firebase.database().ref('users')
  };

  displayChannels = starredChannels => {
    return (
      starredChannels.length > 0 &&
      starredChannels.map(channel => (
        <Menu.Item
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === this.state.activeChannel}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    const { setCurrentChannel, setPrivateChannel } = this.props;
    setCurrentChannel(channel);
    setPrivateChannel(false);
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  componentDidMount() {
    if (this.props.user) {
      this.addListeners(this.props.user.uid);
    }
  }

  addListeners = userId => {
    const { usersRef, starredChannels } = this.state;
    usersRef
      .child(userId)
      .child('starred')
      .on('child_added', snap => {
        const starredChannel = { ...snap.val(), id: snap.key };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });

    usersRef
      .child(userId)
      .child('starred')
      .on('child_removed', snap => {
        const removedChannel = {
          id: snap.key,
          ...snap.val()
        };

        const filteredChannels = starredChannels.filter(
          channel => channel.id !== removedChannel.id
        );

        this.setState({ starredChannels: filteredChannels });
      });
  };

  removeListeners = () => {
    const { usersRef } = this.state;
    const { user } = this.props;
    usersRef.child(`${user.uid}/starred`).off();
  };

  componentWillUnmount() {
    this.removeListeners();
  }

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className={'menu'}>
        <Menu.Item>
          <span>
            <Icon name="star" /> Starred
          </span>{' '}
          ({starredChannels.length})
        </Menu.Item>

        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.currentUser
});

export default connect(
  mapStateToProps,
  { setCurrentChannel, setPrivateChannel }
)(Starred);
