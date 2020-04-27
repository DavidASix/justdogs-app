import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AdMobBanner } from 'react-native-admob';
/*
import PushNotification from 'react-native-push-notification'
*/
class App extends React.Component {/*
  constructor(props) {
    super(props);
    this.state = {
      token: ''
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
      senderID: "14949329329",
      // Unsure about this but tutorial says keep it false
      popInitialNotification: false,
      // Yes, we need permission
      requestPermissions: true
    });
  }
*/

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ borderWidth: 5, borderColor: 'green', flex: 1 }}>
          <View style={{ borderWidth: 1, justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%' }}>
            <Text>
              Lottie + AdMob + Noti Test
            </Text>

            <View style={{ width: 200, height: 200, borderWidth: 1, borderColor: 'red' }}>
              <LottieView source={require('./src/images/doggieTrot.json')} autoPlay loop />
            </View>
{/*}
            <Text>
              Notification FCM Token: {this.state.token}
            </Text>
*/}
            <AdMobBanner
              adSize='banner'
              adUnitID='ca-app-pub-3940256099942544/6300978111'
              testDevices={[AdMobBanner.simulatorId]}
              onDidFailToReceiveAdWithError={() => console.log('no ad')}
              style={{ position: 'absolute', bottom: 0 }}
            />

          </View>
        </SafeAreaView>
      </>
    );
  }
};

export default App;
