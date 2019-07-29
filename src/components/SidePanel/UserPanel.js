import React from 'react';
import { connect } from 'react-redux';
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';
import firebase from '../../firebase';

class UserPanel extends React.Component {
  state = {
    modal: false,
    previewImage: '',
    croppedImage: '',
    uploadedCroppedImage: '',
    blob: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref('users'),
    metadata: {
      contentType: 'image/jpeg'
    }
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
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
        text: <span onClick={this.openModal}>Change Avatar</span>
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

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  handleAvatarChange = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadUrl => {
          this.setState({ uploadedCroppedImage: downloadUrl }, () => {
            this.changeAvatar();
          });
        });
      });
  };

  changeAvatar = () => {
    const { userRef, uploadedCroppedImage, usersRef } = this.state;
    const { currentUser } = this.props;
    userRef
      .updateProfile({
        photoURL: uploadedCroppedImage
      })
      .then(() => {
        console.log('PhotoURL update');
        this.closeModal();
      })
      .catch(err => console.log(err));

    usersRef
      .child(currentUser.uid)
      .update({
        avatar: uploadedCroppedImage
      })
      .then(() => console.log('Avatar updated'))
      .catch(err => console.log(err));
  };

  render() {
    const { modal, previewImage, croppedImage } = this.state;
    const { currentUser, color } = this.props;
    return (
      <Grid style={{ background: color }}>
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
            <Header style={{ padding: '0.25em' }} as={'h4'} inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={currentUser.photoURL} spaced={'right'} avatar />
                    {currentUser.displayName}
                  </span>
                }
                options={this.dropdownOptions(currentUser)}
              />
            </Header>
          </Grid.Row>
          <Modal open={modal} basic onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5em auto' }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.handleAvatarChange}
                >
                  <Icon name="save" /> Change Avatar
                </Button>
              )}

              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>

              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser
});

export default connect(mapStateToProps)(UserPanel);
