import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
} from 'react-native';

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
          <Text>Just Dogs</Text>
        </SafeAreaView>
      </>
    );
  }
};

export default App;
