import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Segment, Button, Input } from 'semantic-ui-react';
import uuid from 'uuid/v4';
import firebase from '../../firebase';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component {
  static defaultProps = {
    currentChannel: null
  };

  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    currentChannel: PropTypes.object
  };

  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref('typing'),
    message: '',
    loading: false,
    errors: [],
    uploadPercent: 0,
    modal: false,
    uploadState: '',
    uploadTask: null
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleKeyDown = () => {
    const { message, typingRef } = this.state;
    const { currentChannel, currentUser } = this.props;

    if (message) {
      typingRef
        .child(currentChannel.id)
        .child(currentUser.uid)
        .set(currentUser.displayName);
    } else {
      this.removeTypingRef();
    }
  };

  createMessage = (fileUrl = null) => {
    const { currentUser } = this.props;
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    };

    if (fileUrl !== null) {
      newMessage.image = fileUrl;
    } else {
      const { message } = this.state;
      newMessage.content = message;
    }

    return newMessage;
  };

  removeTypingRef = () => {
    const { currentChannel, currentUser } = this.props;
    this.state.typingRef
      .child(currentChannel.id)
      .child(currentUser.uid)
      .remove();
  };

  sendMessage = () => {
    const { getMessagesRef, currentChannel } = this.props;
    const { message } = this.state;
    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            loading: false,
            message: '',
            errors: []
          });

          this.removeTypingRef();
        })
        .catch(err => {
          const { errors } = this.state;
          this.setState({
            loading: false,
            errors: errors.concat(err)
          });
        });
    } else {
      const { errors } = this.state;
      this.setState({ errors: errors.concat({ message: 'Add a message' }) });
    }
  };

  getPath = () => {
    const { isPrivateChannel, currentChannel } = this.props;
    return isPrivateChannel
      ? `chat/private-${currentChannel.id}`
      : 'chat/public';
  };

  uploadFile = (file, metadata) => {
    const { storageRef, errors } = this.state;
    const { currentChannel, getMessagesRef } = this.props;
    const ref = getMessagesRef();
    const pathToUpload = currentChannel.id;
    const filePath = `${this.getPath()}/${uuid()}.jpg`;
    this.setState(
      {
        uploadState: 'uploading',
        uploadTask: storageRef.child(filePath).put(file, metadata)
      },
      () => {
        const { uploadTask } = this.state;
        uploadTask.on(
          'state_changed',
          snap => {
            const percentage = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ uploadPercent: percentage });
          },
          err => {
            this.setState({
              errors: errors.concat(err),
              uploadState: 'error',
              uploadTask: null
            });
          },
          () => {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(url => {
                this.sendFileMessage(url, ref, pathToUpload);
              })
              .catch(err => {
                this.setState({
                  errors: errors.concat(err),
                  uploadState: 'error',
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (url, ref, path) => {
    ref
      .child(path)
      .push()
      .set(this.createMessage(url))
      .then(() => {
        this.setState({ uploadState: 'done' });
      })
      .catch(err => {
        const { errors } = this.state;
        this.setState({
          errors: errors.concat(err)
        });
      });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      uploadPercent
    } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: '0.7em' }}
          label={<Button icon="add" />}
          labelPosition="left"
          placeholder="Write your message"
          onChange={this.handleChange}
          className={
            errors.some(err => err.message.includes('message')) ? 'error' : ''
          }
          onKeyDown={this.handleKeyDown}
          value={message}
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
            disabled={loading}
          />
          <Button
            color="teal"
            disabled={uploadState === 'uploading'}
            content="Upload media"
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          upload={this.uploadFile}
        />
        <ProgressBar uploadState={uploadState} percentage={uploadPercent} />
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel,
  currentUser: state.user.currentUser,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(MessageForm);
