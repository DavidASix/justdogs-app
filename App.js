import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AdMobBanner } from 'react-native-admob';

import PushNotification from 'react-native-push-notification';
import { setCustomTextInput, setCustomText } from 'react-native-global-props';

import InfiniteScroll from './src/InfiniteScroll';

const fontFamilyProps = { style: { fontSize: 16, fontFamily: 'fenix' } };
setCustomTextInput(fontFamilyProps);
setCustomText(fontFamilyProps);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: 'Loading....'
    }
  }
  componentDidMount() {
    PushNotification.configure({
      onRegister: async ({ token }) => {
        // Runs on login and generates a token to communicate with the FCM server (firebase)
        //https://shift.infinite.red/react-native-node-js-and-push-notifications-e851b279a0cd
        // The above tutorial isn't super well written but was crucial for me piecing this together
        console.log(token);
        this.setState({ token });
      },
      onNotification: (notification) => {
        // Notification was received
        console.log(notification)
      },
      // Sender ID comes from firebase, see docs here:
      // https://github.com/zo0r/react-native-push-notification
      senderID: "87291361734",
      // Unsure about this but tutorial says keep it false
      popInitialNotification: false,
      // Yes, we need permission
      requestPermissions: true
    });
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
