import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Form, Segment, Header, Icon, Button, Message } from 'semantic-ui-react';
import firebase from '../../firebase';

class Login extends React.Component {
   state = {
      email: '',
      password: '',
      errors: [],
      loading: false
   };


   handleChange = event => {
      this.setState({ [event.target.name]: event.target.value });
   };

   handleInputError = (errors, inputName) => {
      return errors.some(err => err.message.toLowerCase()
        .includes(inputName)) ? 'error' : '';
   };

   handleSubmit = event => {
      event.preventDefault();
      if (this.isFormValid(this.state)) {
         this.setState({
            errors: [],
            loading: true
         });
         const { email, password } = this.state;
         firebase.auth()
           .signInWithEmailAndPassword(email, password)
           .then((signedInUser) => {
              console.log(signedInUser);
              this.setState({ loading: false });
           })
           .catch(err => {
              this.setState({
                 errors: this.state.errors.concat(err),
                 loading: false
              });
           });
      }
   };

   isFormValid = ({ email, password }) => {
      return email && password;
   };


   displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

   render() {
      const { email, password, errors, loading } = this.state;
      return (
        <Grid textAlign={'center'} verticalAlign={'middle'} className={'app'}>
           <Grid.Column style={{ maxWidth: 450 }}>
              <Header as={'h1'} icon color={'violet'} textAlign={'center'}>
                 <Icon name={'code branch'} color={'violet'}/>
                 Login for DevChat
              </Header>
              <Form size={'large'} onSubmit={this.handleSubmit}>
                 <Segment stacked>

                    <Form.Input fluid name={'email'} icon={'mail'} iconPosition={'left'}
                                placeholder={'Email address'} onChange={this.handleChange}
                                type={'email'} value={email}
                                className={this.handleInputError(errors, 'email')}/>

                    <Form.Input fluid name={'password'} icon={'lock'} iconPosition={'left'}
                                placeholder={'Password'} onChange={this.handleChange}
                                type={'password'} value={password}
                                className={this.handleInputError(errors, 'password')}/>

                    <Button disabled={loading} className={loading ? 'loading' : ''} type={'submit'}
                            color={'violet'} fluid size={'large'}>Submit</Button>
                 </Segment>
              </Form>
              {errors.length > 0 && (
                <Message error>
                   <h3>Error</h3>
                   {this.displayErrors(errors)}
                </Message>
              )}
              <Message>Don't have a account? <Link to={'/register'}>Register</Link></Message>
           </Grid.Column>
        </Grid>
      );
   }
}

export default Login;
