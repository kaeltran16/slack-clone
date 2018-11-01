import React from 'react';
import { Menu } from 'semantic-ui-react';
import Channel from './Channel';
import DirectMessages from './DirectMessages';
import UserPanel from './UserPanel';

class SidePanel extends React.Component {
   render() {
      return (
        <Menu size={'large'} inverted fixed={'left'} vertical style={{
           background: '#4c3c4c',
           fontSize: '1.4em'
        }}>
           <UserPanel/>
           <Channel/>
           <DirectMessages/>
        </Menu>
      );
   }
}

export default SidePanel;
