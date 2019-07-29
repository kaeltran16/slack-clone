import React from 'react';
import { connect } from 'react-redux';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';
import firebase from '../../firebase';

class UserPanel extends React.Component {
  dropdownOptions = user => {
    return [
      {
        key: 'user',
        text: (
          <span>
            Signed in as <strong>{user.displayName}</strong>
          </span>
        ),
        disabled: true
      },
      {
        key: 'avatar',
        text: <span>Change Avatar</span>
      },
      {
        key: 'signout',
        text: <span onClick={this.handleSignout}>Sign Out</span>
      }
    ];
  };
  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log('signout'));
  };

  render() {
    const { currentUser } = this.props;
    const user = JSON.parse(JSON.stringify(currentUser));
    return (
      <Grid style={{ background: '#4c3c4c' }}>
        <Grid.Column>
          <Grid.Row
            style={{
              padding: '1.2em',
              margin: 0
            }}
          >
            <Header inverted floated={'left'} as={'h2'}>
              <Icon name={'code'} />
              <Header.Content>DevChat</Header.Content>
            </Header>
          </Grid.Row>
          <Header style={{ padding: '0.25em' }} as={'h4'} inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={user.photoURL} spaced={'right'} avatar />
                  {user.displayName}
                </span>
              }
              options={this.dropdownOptions(user)}
            />
          </Header>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser
});

export default connect(mapStateToProps)(UserPanel);
