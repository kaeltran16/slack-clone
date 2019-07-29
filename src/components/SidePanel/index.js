import React from 'react';
import { Menu } from 'semantic-ui-react';
import Channel from './Channel';
import DirectMessages from './DirectMessages';
import UserPanel from './UserPanel';
import Starred from './Starred';

class SidePanel extends React.Component {
  render() {
    const { color } = this.props;
    return (
      <Menu
        size={'large'}
        inverted
        fixed={'left'}
        vertical
        style={{
          background: color,
          fontSize: '1.4em'
        }}
      >
        <UserPanel color={color} />
        <Starred />
        <Channel />
        <DirectMessages />
      </Menu>
    );
  }
}

export default SidePanel;
