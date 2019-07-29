import React from 'react';
import { Grid } from 'semantic-ui-react';
import './App.css';
import ColorPanel from './ColorPanel';
import Messages from './Messages';
import MetaPanel from './MetaPanel';
import SidePanel from './SidePanel';
import { connect } from 'react-redux';
const App = ({ color }) => {
  return (
    <Grid
      columns="equal"
      className="app"
      style={{ background: color.secondaryColor }}
    >
      <ColorPanel />
      <SidePanel color={color.primaryColor} />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = state => ({
  color: state.color
});

export default connect(mapStateToProps)(App);
