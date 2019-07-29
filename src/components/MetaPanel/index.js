import React from 'react';
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List
} from 'semantic-ui-react';
import { connect } from 'react-redux';
class MetaPanel extends React.Component {
  state = {
    activeIndex: 0
  };

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  displayTopPosters = posts => {
    return Object.entries(posts)
      .sort((first, second) => second[1] - first[1])
      .map(([key, val], index) => (
        <List.Item key={index}>
          <Image avatar src={val.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{val.count} post(s)</List.Description>
          </List.Content>
        </List.Item>
      ))
      .slice(0, 5);
  };
  render() {
    const { activeIndex } = this.state;
    const { isPrivateChannel, channel, userPosts } = this.props;
    return (
      !isPrivateChannel &&
      channel && (
        <Segment loading={!channel}>
          <Header as="h3" attached="top">
            About #{channel && channel.name}
          </Header>
          <Accordion styled attached="true">
            <Accordion.Title
              active={activeIndex === 0}
              index={0}
              onClick={this.setActiveIndex}
            >
              <Icon name="dropdown" />
              <Icon name="info" />
              Channel Details
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0}>
              {channel && channel.detail}
            </Accordion.Content>

            <Accordion.Title
              active={activeIndex === 1}
              index={1}
              onClick={this.setActiveIndex}
            >
              <Icon name="dropdown" />
              <Icon name="user circle" />
              Top Poster
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 1}>
              <List>{userPosts && this.displayTopPosters(userPosts)}</List>
            </Accordion.Content>

            <Accordion.Title
              active={activeIndex === 2}
              index={2}
              onClick={this.setActiveIndex}
            >
              <Icon name="dropdown" />
              <Icon name="pencil alternate" />
              Created By
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 2}>
              <Header as="h3">
                <Image circular src={channel && channel.createdBy.avatar} />
                {channel && channel.createdBy.name}
              </Header>
            </Accordion.Content>
          </Accordion>
        </Segment>
      )
    );
  }
}

const mapStateToProps = state => ({
  isPrivateChannel: state.channel.isPrivateChannel,
  channel: state.channel.currentChannel,
  userPosts: state.channel.userPosts
});

export default connect(mapStateToProps)(MetaPanel);
