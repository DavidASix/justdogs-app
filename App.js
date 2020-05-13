import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import { setCustomTextInput, setCustomText } from 'react-native-global-props';

import Loading from './src/Loading';

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
        <SafeAreaView style={{ borderWidth: 0, flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Loading />
        </SafeAreaView>
      </>
    );
  }
};

export default App;
