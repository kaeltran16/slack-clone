import React from 'react';
import connect from 'react-redux/es/connect/connect';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import { setCurrentChannel } from '../../actions';
import firebase from '../../firebase';

class Channel extends React.Component {
   state = {
      channels: [],
      channelName: '',
      channelDetail: '',
      modal: false,
      channelsRef: firebase.database()
        .ref('channels'),
      firstLoad: true,
      activeChannel: ''
   };
   addListeners = () => {
      let loadedChannels = [];
      this.state.channelsRef.on('child_added', snap => {
         loadedChannels.push(snap.val());
         this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      });
   };

   removeListeners = () => {
      this.state.channelsRef.off();
   };

   setFirstChannel = () => {
      const { firstLoad, channels } = this.state;

      if (firstLoad && channels.length > 0) {
         this.props.setCurrentChannel(channels[0]);
         this.setActiveChannel(channels[0]);
      }

      this.setState({ firstLoad: false });
   };
   closeModal = () => this.setState({ modal: false });
   openModal = () => this.setState({ modal: true });
   handleChange = (event) => {
      const { name, value } = event.target;
      this.setState({ [name]: value });
   };
   handleSubmit = event => {
      event.preventDefault();
      if (this.isFormValid(this.state)) {
         this.addChannel();
      }
   };
   isFormValid = ({ channelName, channelDetail }) => channelName && channelDetail;
   addChannel = () => {
      const { channelsRef, channelName, channelDetail } = this.state;
      const { currentUser } = this.props;
      const key = channelsRef.push().key;
      const newChannel = {
         id: key,
         name: channelName,
         detail: channelDetail,
         createdBy: {
            name: currentUser.displayName,
            avatar: currentUser.photoURL
         }
      };

      channelsRef.child(key)
        .update(newChannel)
        .then(() => {
           this.setState({
              channelName: '',
              channelDetail: ''
           });
           this.closeModal();
           console.log('channel added');
        })
        .catch(err => console.log(err));
   };
   displayChannels = (channels) => {
      return channels.length > 0 && channels.map(channel => (
        <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name}
                   style={{ opacity: 0.7 }} active={channel.id === this.state.activeChannel}>
           # {channel.name}
        </Menu.Item>
      ));
   };
   changeChannel = channel => {
      this.setActiveChannel(channel);
      this.props.setCurrentChannel(channel);
   };

   setActiveChannel = channel => {
      this.setState({ activeChannel: channel.id });
   };

   componentDidMount() {
      this.addListeners();
   }

   componentWillUnmount() {
      this.removeListeners();
   }

   render() {
      const { channels, modal } = this.state;
      return (
        <React.Fragment>
           <Menu.Menu style={{ paddingBottom: '2em' }}>
              <Menu.Item>
               <span>
                  <Icon name='exchange'/> CHANNELS
               </span>{' '}
                 ({channels.length}) <Icon name={'add'} onClick={this.openModal}/>
              </Menu.Item>

              {this.displayChannels(channels)}
           </Menu.Menu>

           <Modal basic open={modal} onClose={this.closeModal}>
              <Modal.Header>
                 Add a channel
              </Modal.Header>
              <Modal.Content>
                 <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                       <Input fluid label={'Name of Channel'} name={'channelName'}
                              onChange={this.handleChange}/>
                    </Form.Field>
                    <Form.Field>
                       <Input fluid label={'About the Channel'} name={'channelDetail'}
                              onChange={this.handleChange}/>
                    </Form.Field>
                 </Form>
              </Modal.Content>

              <Modal.Actions>
                 <Button color={'green'} inverted onClick={this.handleSubmit}>
                    <Icon name={'checkmark'}/> Add
                 </Button>

                 <Button color={'red'} inverted onClick={this.closeModal}>
                    <Icon name={'remove'}/> Cancel
                 </Button>
              </Modal.Actions>
           </Modal>
        </React.Fragment>
      );
   }
}

const mapStateToProps = ({ user }) => ({
   currentUser: user.currentUser
});

export default connect(mapStateToProps, { setCurrentChannel })(Channel);
