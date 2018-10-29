import firebase from 'firebase';
import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import uuid from 'uuid/v4';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component {
   state = {
      storageRef: firebase.storage()
        .ref(),
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

   createMessage = (fileUrl = null) => {
      const { currentUser } = this.props;
      const message = {
         timestamp: firebase.database.ServerValue.TIMESTAMP,
         user: {
            id: currentUser.uid,
            name: currentUser.displayName,
            avatar: currentUser.photoURL
         }
      };

      if (fileUrl !== null) {
         message.image = fileUrl;
      } else {
         message.content = this.state.message;
      }

      return message;
   };


   sendMessage = () => {
      const { messages, currentChannel } = this.props;
      const { message } = this.state;
      if (message) {
         this.setState({ loading: true });
         messages.child(currentChannel.id)
           .push()
           .set(this.createMessage())
           .then(() => {
              this.setState({
                 loading: false,
                 message: '',
                 errors: []
              });
           })
           .catch(err => {
              console.log(err);
              this.setState({
                 loading: false,
                 errors: this.state.errors.concat(err)
              });
           });
      } else {
         this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) });
      }
   };

   uploadFile = (file, metadata) => {
      const pathToUpload = this.props.currentChannel.id;
      const { messages } = this.props;
      const filePath = `chat/public/${uuid()}.jpg`;
      console.log(filePath);
      this.setState({
         uploadState: 'uploading',
         uploadTask: this.state.storageRef.child(filePath)
           .put(file, metadata)
      }, () => {
         this.state.uploadTask.on('state_changed', snap => {
            const percentage = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            this.setState({ uploadPercent: percentage });
         }, err => {
            console.log(err);
            this.setState({
               errors: this.state.errors.concat(err),
               uploadState: 'error',
               uploadTask: null
            });
         }, () => {
            this.state.uploadTask.snapshot.ref.getDownloadURL()
              .then(url => {
                 this.sendFileMessage(url, messages, pathToUpload);
              })
              .catch(err => {
                 console.log(err);
                 this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: 'error',
                    uploadTask: null
                 });
              });
         });
      });
   };

   sendFileMessage = (url, ref, path) => {
      ref.child(path)
        .push()
        .set(this.createMessage(url))
        .then(() => {
           this.setState({ uploadState: 'done' });
        })
        .catch(err => {
           console.log(err);
           this.setState({
              errors: this.state.errors.concat(err)
           });
        });
   };

   render() {
      const { errors, message, loading, modal, uploadState, uploadPercent } = this.state;
      return (
        <Segment className={'message__form'}>
           <Input fluid name={'message'} style={{ marginBottom: '0.7em' }}
                  label={<Button icon={'add'}/>} labelPosition={'left'}
                  placeholder={'Write your message'} onChange={this.handleChange}
                  className={errors.some(err => err.message.includes('message')) ? 'error' : ''}
                  value={message}/>
           <Button.Group icon widths={'2'}>
              <Button color={'orange'} content={'Add Reply'} labelPosition={'left'} icon={'edit'}
                      onClick={this.sendMessage} disabled={loading}/>
              <Button color={'teal'} content={'Upload media'} labelPosition={'right'}
                      icon={'cloud upload'} onClick={this.openModal}/>
           </Button.Group>
           <FileModal modal={modal} closeModal={this.closeModal} upload={this.uploadFile}/>
           <ProgressBar uploadState={uploadState} percentage={uploadPercent}/>
        </Segment>
      );
   }
}


export default MessageForm;
