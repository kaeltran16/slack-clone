import React from 'react';
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import { setColors } from '../../actions';
class ColorPanel extends React.Component {
  state = {
    modal: false,
    primaryColor: '',
    secondaryColor: '',
    userRef: firebase.database().ref('users'),
    userColors: []
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handlePrimaryColorChange = color => {
    this.setState({ primaryColor: color.hex });
  };

  handleSecondaryColorChange = color => {
    this.setState({ secondaryColor: color.hex });
  };

  handleSaveColors = () => {
    const { primaryColor, secondaryColor } = this.state;
    if (primaryColor && secondaryColor) {
      this.saveColors(primaryColor, secondaryColor);
    }
  };

  saveColors = (primaryColor, secondaryColor) => {
    const { userRef } = this.state;
    const { user } = this.props;

    userRef
      .child(`${user.uid}/colors`)
      .push()
      .update({
        primaryColor,
        secondaryColor
      })
      .then(() => {
        console.log('Colors added');
        this.closeModal();
      })
      .catch(err => console.log(err));
  };

  addListeners = userId => {
    let userColors = [];
    const { userRef } = this.state;
    userRef.child(`${userId}/colors`).on('child_added', snap => {
      userColors.unshift(snap.val());
      this.setState({ userColors });
    });
  };

  displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, index) => (
      <React.Fragment key={index}>
        <Divider />
        <div
          className="color__container"
          onClick={() =>
            this.props.setColors(color.primaryColor, color.secondaryColor)
          }
        >
          <div
            className="color__square"
            style={{ background: color.primaryColor }}
          >
            <div
              className="color__overlay"
              style={{ background: color.secondaryColor }}
            />
          </div>
        </div>
      </React.Fragment>
    ));

  componentDidMount() {
    if (this.props.user) {
      this.addListeners(this.props.user.uid);
    }
  }

  render() {
    const { modal, primaryColor, secondaryColor, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" />
              <SliderPicker
                color={primaryColor}
                onChange={this.handlePrimaryColorChange}
              />
            </Segment>
            <Segment inverted>
              <Label content="Secondary Color" />
              <SliderPicker
                color={secondaryColor}
                onChange={this.handleSecondaryColorChange}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.currentUser
});

export default connect(
  mapStateToProps,
  { setColors }
)(ColorPanel);
