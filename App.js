import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';

import Loading from './src/Loading';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ borderWidth: 0, flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Loading />
        </SafeAreaView>
      </>
    );
  }
};

export default App;
