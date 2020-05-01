import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import { setCustomTextInput, setCustomText } from 'react-native-global-props';

import InfiniteScroll from './src/InfiniteScroll';

const fontFamilyProps = { style: { fontSize: 16, fontFamily: 'fenix' } };
setCustomTextInput(fontFamilyProps);
setCustomText(fontFamilyProps);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }


  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ borderWidth: 0, flex: 1 }}>
          <InfiniteScroll />
        </SafeAreaView>
      </>
    );
  }
};

export default App;
