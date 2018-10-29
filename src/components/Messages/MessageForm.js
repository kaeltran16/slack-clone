import firebase from 'firebase';
import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';

class MessageForm extends React.Component {
   state = {
      message: '',
      loading: false,
      errors: []
   };

   handleChange = event => {
      const { name, value } = event.target;
      this.setState({ [name]: value });
   };

   createMessage = () => {
      const { currentUser } = this.props;
      const message = {
         content: this.state.message,
         timestamp: firebase.database.ServerValue.TIMESTAMP,
         user: {
            id: currentUser.uid,
            name: currentUser.displayName,
            avatar: currentUser.photoURL
         }
      };

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

   render() {
      const { errors, message, loading } = this.state;
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
                      icon={'cloud upload'}/>
           </Button.Group>
        </Segment>
      );
   }
}


export default MessageForm;
