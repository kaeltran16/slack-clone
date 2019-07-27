import md5 from 'md5';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { setUser } from '../../actions';
import { Grid, Form, Segment, Header, Icon, Button, Message } from 'semantic-ui-react';
import firebase from '../../firebase';

class Register extends React.Component {
   state = {
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      errors: [],
      loading: false,
      userRef: firebase.database()
         .ref('users')
   };

   isFormValid = () => {
      const errors = [];
      const error = {};
      if (this.isFormEmpty(this.state)) {
         error.message = 'Fill all the fields';
         this.setState({ errors: errors.concat(error) });
      } else if (!this.isPasswordValid(this.state)) {
         error.message = 'Password is invalid';
         this.setState({ errors: errors.concat(error) });
      }
      return Object.keys(error).length === 0;
   };

   isFormEmpty = ({ username, email, password, passwordConfirmation }) => !username.length
      || !email.length || !password.length
      || !passwordConfirmation.length;

   isPasswordValid = ({ password, passwordConfirmation }) => {
      let isValid = true;
      if (password.length < 6 || passwordConfirmation.length < 6) {
         isValid = false;
      } else if (password !== passwordConfirmation) {
         isValid = false;
      }
      return isValid;
   };

   handleChange = event => {
      this.setState({ [event.target.name]: event.target.value });
   };

   handleInputError = (errors, inputName) => (errors.some(err => err.message.toLowerCase()
      .includes(inputName)) ? 'error' : '');

   handleSubmit = event => {
      event.preventDefault();
      if (this.isFormValid()) {
         this.setState({
            errors: [],
            loading: true
         });
         const { email, password, username } = this.state;
         firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(createdUser => {
               createdUser.user.updateProfile({
                  displayName: username,
                  photoURL: `https://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
               })
                  .then(() => {
                     this.saveUser(createdUser)
                        .then(() => {
                           console.log(`Save user ${createdUser}`)
                           setUser(createdUser);
                           this.props.history.push('/')
                        });
                  })
                  .catch(err => {
                     const { errors } = this.state;
                     this.setState({
                        errors: errors.concat(err),
                        loading: false
                     });
                     console.log(err);
                  });
            })
            .catch(err => {
               const { errors } = this.state;
               this.setState({
                  errors: errors.concat(err),
                  loading: false
               });
            });
      }
   };

   saveUser = createdUser => {
      const { displayName, photoURL, uid } = createdUser.user;
      const { userRef } = this.state;
      return userRef.child(uid)
         .set({
            name: displayName,
            avatar: photoURL
         });
   };


   displayErrors = errors => errors.map(error => <p key={error.code}>{error.message}</p>);

   componentWillUnmount() {
      this.state.userRef.off();
   }

   render() {
      const { username, email, password, passwordConfirmation, errors, loading } = this.state;
      return (
         <Grid textAlign='center' verticalAlign='middle' className='app'>
            <Grid.Column style={{ maxWidth: 450 }}>
               <Header as='h1' icon color='orange' textAlign='center'>
                  <Icon name='puzzle piece' />
                  {`Register for DevChat`}
               </Header>
               <Form size='large' onSubmit={this.handleSubmit}>
                  <Segment stacked>
                     <Form.Input fluid name='username' icon='user' iconPosition='left'
                        placeholder='User name' onChange={this.handleChange}
                        type='text' value={username}
                        className={this.handleInputError(errors, 'username')} />

                     <Form.Input fluid name='email' icon='mail' iconPosition='left'
                        placeholder='Email address' onChange={this.handleChange}
                        type='email' value={email}
                        className={this.handleInputError(errors, 'email')} />

                     <Form.Input fluid name='password' icon='lock' iconPosition='left'
                        placeholder='Password' onChange={this.handleChange}
                        type='password' value={password}
                        className={this.handleInputError(errors, 'password')} />

                     <Form.Input fluid name='passwordConfirmation' icon='lock'
                        iconPosition='left'
                        placeholder='Password Confirmation'
                        onChange={this.handleChange} type='password'
                        value={passwordConfirmation}
                        className={this.handleInputError(errors, 'password')} />
                     <Button disabled={loading} className={loading ? 'loading' : ''} type='submit'
                        color='orange' fluid size='large'>
                        {`Submit`}
                     </Button>
                  </Segment>
               </Form>
               {errors.length > 0 && (
                  <Message error>
                     <h3>Error</h3>
                     {this.displayErrors(errors)}
                  </Message>
               )}
               <Message>
                  {`Already a user?`}
                  <Link to='/login'>Login</Link>
               </Message>
            </Grid.Column>
         </Grid>
      );
   }
}

export default withRouter(connect(null, {
   setUser,
})(Register))
