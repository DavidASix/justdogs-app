import React from 'react';
import {
  View,
  Image,
  Platform,
  Modal,
  TextInput,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification'
import InfiniteScroll from './InfiniteScroll';
import axios from 'axios';
import * as c from './constants';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: false,
      loading: true,
      showAds: true,
      showRestoreModal: false,
      emailText: '',
      emailSubmitLoading: false
     };
    this.items = ['com.dave6.www.stroller.justdogs.noads', 'com.dave6.www.stroller.justdogs.beer'];
    this.purchaseListener = null;
    this.purchaseErrorListener = null;
  }

/*
purchaseUpdatedListener
{
  "autoRenewingAndroid": false,
  "dataAndroid": "{\"orderId\":\"GPA.3339-2572-6607-68627\",\"packageName\":\"com.dave6.stroller.justdogs\",\"productId\":\"com.dave6.www.stroller.justdogs.noads\",\"purchaseTime\":1589067698721,\"purchaseState\":0,\"purchaseToken\":\"mhogdihfgcopgenoomlbkafp.AO-J1OybrSx7ITnFT3dPmvlv0SLAJr7ZV2B8lEqlL0cYvsxLuAQKQDwXueYvJDQ1H4QRh-n7kafznt2cclYv-xssv-aMNu7GwggKnRm3Yc1daeSlwr3OVPmJ9bwvxI7CFao0hhXZy4yfmoSLj5FMlgISlcsd4nySZ8WU88j8fxrT8yBYg5yHsmQ\",\"acknowledged\":false}",
  "isAcknowledgedAndroid": false,
  "productId": "com.dave6.www.stroller.justdogs.noads",
  "purchaseStateAndroid": 1,
  "purchaseToken": "mhogdihfgcopgenoomlbkafp.AO-J1OybrSx7ITnFT3dPmvlv0SLAJr7ZV2B8lEqlL0cYvsxLuAQKQDwXueYvJDQ1H4QRh-n7kafznt2cclYv-xssv-aMNu7GwggKnRm3Yc1daeSlwr3OVPmJ9bwvxI7CFao0hhXZy4yfmoSLj5FMlgISlcsd4nySZ8WU88j8fxrT8yBYg5yHsmQ",
  "signatureAndroid": "ZheZDB8HoYqymKZB0z3iRrZFS1C4VUznan3JtqrtVfZBiU8LRx5+Z68KXLRFU4gkiykcJg71GNtAUhGjpYY21+zHcaO3HnOq0GX7JLSHLPJJABfQ0sBAykMzd09EtKTMRlIGDEHlSRm9sSxMOfDptx+yhlfba0HCuRX4UEgF2wGn/FeZaAZ81of2t7prB4s6Amfp2vngMH0HoGF+FXfOlIK0J0529mkz9HSrCGY5ATX6nXmLiQ27XdOJQEuLCGtHLi5SjUm40uNa5bB/MDq/vgz5G+ylexxIpul+TTlddL/UI9V9vGpdsqjCVd3emSe1MQhoRPCqHAICXQ3eSVOMbQ==",
  "transactionDate": 1589067698721,
  "transactionId": "GPA.3339-2572-6607-68627",
  "transactionReceipt": "{\"orderId\":\"GPA.3339-2572-6607-68627\",\"packageName\":\"com.dave6.stroller.justdogs\",\"productId\":\"com.dave6.www.stroller.justdogs.noads\",\"purchaseTime\":1589067698721,\"purchaseState\":0,\"purchaseToken\":\"mhogdihfgcopgenoomlbkafp.AO-J1OybrSx7ITnFT3dPmvlv0SLAJr7ZV2B8lEqlL0cYvsxLuAQKQDwXueYvJDQ1H4QRh-n7kafznt2cclYv-xssv-aMNu7GwggKnRm3Yc1daeSlwr3OVPmJ9bwvxI7CFao0hhXZy4yfmoSLj5FMlgISlcsd4nySZ8WU88j8fxrT8yBYg5yHsmQ\",\"acknowledged\":false}"
}

  receipt:  {
  "orderId":"GPA.3339-2572-6607-68627",
  "packageName":"com.dave6.stroller.justdogs",
  "productId":"com.dave6.www.stroller.justdogs.noads",
  "purchaseTime":1589067698721,
  "purchaseState":0,
  "purchaseToken":"mhogdihfgcopgenoomlbkafp.AO-J1OybrSx7ITnFT3dPmvlv0SLAJr7ZV2B8lEqlL0cYvsxLuAQKQDwXueYvJDQ1H4QRh-n7kafznt2cclYv-xssv-aMNu7GwggKnRm3Yc1daeSlwr3OVPmJ9bwvxI7CFao0hhXZy4yfmoSLj5FMlgISlcsd4nySZ8WU88j8fxrT8yBYg5yHsmQ",
  "acknowledged":false
}
*/

  async componentDidMount() {
    // Init IAP and get purchasable items
    try {
      const result = await RNIap.initConnection();
      const purchases = await RNIap.getAvailablePurchases();
      const products = await RNIap.getProducts(this.items);
      const consume = await RNIap.consumeAllItemsAndroid();
      this.setState({ products });
    } catch (err) {
      console.log('err in iap init: ', err);
    }


    try {
      // check if a user has logged in before
      let uid = await AsyncStorage.getItem('@uid')
      // check if stored UID is on server, if not send back a new one
      let { data } = await axios.post(`${c.urls.dave}checkUser`, { webkey: c.webkey, package: c.pn, uid });
      // Store the UID returned from the server
      await AsyncStorage.setItem('@uid', data.uid);

      // setup push notifications
      PushNotification.configure({
        onRegister: async ({ token }) => {
          await axios.post(`${c.urls.dave}updateFCMToken`, { webkey: c.webkey, package: c.pn, userId: data.id, token });
        },
        onNotification: (notification) => {
          // Notification was received
          console.log(notification);
        },
        senderID: "87291361734",
        popInitialNotification: false,
        // Yes, we need permission
        requestPermissions: Platform.OS === 'ios'
      });

      let noAds = await axios.post(`${c.urls.dave}verifyPurchase`, { uid: data.uid, productId: this.items[0], webkey: c.webkey });
      let showRestoreModal = noAds.data ?  !Boolean(data.email) : false;
      console.log('Bools, noads, email, both', { noads: noAds.data, email: data.email, both: !Boolean(noAds.data && data.email) });
      this.setState({
        uid: data.uid,
        showAds: !noAds.data,
        showRestoreModal: noAds.data ? !Boolean(data.email) : false
      });

      // Set up IAP listener for purchases
      this.purchaseListener = RNIap.purchaseUpdatedListener(async (purchase) => {
        try {
          // Check if receipt exists. Receipt is a stringified JSON object
          if (!purchase.transactionReceipt) throw 'No Receipt!';
          // Get users UID from state, if that isn't available get it from storage then the server
          let uid;
          if (this.state.uid) {
            uid = this.state.uid;
          } else {
            let storedUid = await AsyncStorage.getItem('@uid')
            // check if stored UID is on server, if not send back a new one
            let { data } = await axios.post(`${c.urls.dave}checkUser`, { webkey: c.webkey, package: c.pn, uid: storedUid });
            // Store the UID returned from the server
            await AsyncStorage.setItem('@uid', data.uid);
            uid = data.uid;
          }
          // Set up body object for server request
          let body = {
            webkey: c.webkey,
        		uid: this.state.uid,
        		orderId: purchase.transactionId,
        		productId: purchase.productId,
        		purchaseTime: purchase.transactionDate,
        		purchaseToken: purchase.purchaseToken
        	}
          // Store Receipt on server
          await axios.post(`${c.urls.dave}storeReceipt`, body);
          // If no ads was purchased, stop showing ads. This will update the prop which changes the state in InfiniteScroll via componentDidUpdate
          // show modal to collect restore information
          this.setState({ showRestoreModal: true, showAds: purchase.productId !== this.items[0] })
          // Tell the store that you have delivered what has been paid for, failure to do this will result in the purchase being refunded
          RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
          RNIap.finishTransaction(purchase, false);
        } catch (err) {
            console.log(err);
        }
      });

      // set up purchase Error listener
      this.purchaseErrorListener = RNIap.purchaseErrorListener((error) => {
        console.log('purchaseErrorListener ', error);
      });

    } catch (err) {
      console.log(' Comp mount Err: ,', err);
    } finally {
      this.setState({ loading: false });
    }
  }


  componentWillUnmount() {
    if (this.purchaseListener) this.purchaseListener.remove();
    this.purchaseListener = null;
    if (this.purchaseErrorListener) this.purchaseErrorListener.remove();
    this.purchaseErrorListener = null;
  }


  onPressSubmitEmail = async () => {
    let email = String(this.state.emailText)
    try {
      this.setState({ emailSubmitLoading: true });
      if (!email.match(c.regex.email)) throw { title: 'Invalid Email', body: 'Please enter a valid email' };
      try {
        // Get users UID from state, if that isn't available get it from storage then the server
        let uid;
        if (this.state.uid) {
          uid = this.state.uid;
        } else {
          let storedUid = await AsyncStorage.getItem('@uid')
          // check if stored UID is on server, if not send back a new one
          let { data } = await axios.post(`${c.urls.dave}checkUser`, { webkey: c.webkey, package: c.pn, uid: storedUid });
          // Store the UID returned from the server
          await AsyncStorage.setItem('@uid', data.uid);
          uid = data.uid;
        }
        await axios.post(`${c.urls.dave}storeEmail`, { webkey: c.webkey, uid, email })
        this.setState({ emailSubmitLoading: false, showRestoreModal: false });
      } catch (err) {
        console.log('ServerError: ', err)
        throw { title: 'Server Error', body: 'Try again later' };
      }
    } catch (err) {
      Alert.alert(
        err.title,
        err.body,
        [{ text: 'OK', onPress: () => this.setState({ emailSubmitLoading: false }) }]);
    } finally {
    }
  }
  onDismissModalAttempt = () => {
    Alert.alert(
      'Email is required',
      'An email is required to ensure we can restore your purchase');
  }

  renderLoading() {
      if (this.state.loading) return (
        <>
          <Image source={require('./images/logo.png')} style={{ marginTop: 25, height: 200, width: 200 }} />
          <ActivityIndicator size='large' color={c.colors.accent} style={{ position: 'absolute', bottom: 10 }} />
        </>
      );
      return <InfiniteScroll showAds={this.state.showAds} />
  }

  renderEmailLoading() {
    if (this.state.emailSubmitLoading) return <ActivityIndicator size='small' color={c.colors.accent} />;
    return <Image style={{ width: 20, height: 20 }} source={require('./images/paw.png')} />
  }

  render() {
    return (
      <>
        <Modal
          visible={this.state.showRestoreModal}
          animationType='slide'
          hardwareAccelerated
          onDismiss={this.onDismissModalAttempt}
          onRequestClose={this.onDismissModalAttempt}
          transparent>
          <View style={styles.modalStyle}>
            <View style={{ borderBottomWidth: 1, borderColor: '#d6d6d6', paddingBottom: 10 }}>
              <Text style={{ fontFamily: 'blenda', fontSize: 36 }}>
                Thank you!
              </Text>
              <Text style={{ fontSize: 12, textAlign: 'center' }}>
                Your purchase helps support an independent developer
              </Text>
            </View>

            <View style={{ width: '100%', justif: 'center', alignItems: 'center' }}>
              <View style={{ margin: 5 }}>
                <Text style={{ fontSize: 14, margin: 5 }}>
                  As Just Dogs does not use accounts to track users if you switch devices or reset your phone your purchase may be lost.
                </Text>
                <Text style={{ fontSize: 14, margin: 5 }}>
                  To ensure we are able to restore your purchase please enter your email below.
                </Text>
                <Text style={{ fontSize: 14, margin: 5 }}>
                  Just Dogs will <Text style={{ fontSize: 14, color: 'red' }}>never</Text> send you spam or sell your email.
                </Text>
              </View>
              <View style={styles.textInput}>
                <View style={{  borderBottomWidth: 1, borderColor: c.colors.accent, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                  {this.renderEmailLoading()}
                </View>
                <TextInput
                  style={styles.textInput}
                  onChangeText={text => this.setState({ emailText: text })}
                  value={this.state.emailText}
                  placeholder='youremail@gmail.com'
                  autoCapitalize='none'
                  autoCompleteType='email'
                  keyboardType='email-address'
                  style={{ borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }} />
              </View>
              <TouchableOpacity
                onPress={this.onPressSubmitEmail}
                style={[styles.textInput, { width: '50%' }]}>
                <Text style={{ textAlign: 'center' }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 150, width: 200, alignSelf: 'flex-end' }}>
              <LottieView source={require('./images/doggieTrot.json')} autoPlay loop />
            </View>
          </View>
        </Modal>


        {this.renderLoading()}
      </>
    );
  }
};

const styles = {
  modalStyle: {
    width: '95%',
    height: '95%',
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    elevation: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  textInput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 10,
    width: '95%',
    flex: 0,
    padding: 5,
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: 'inherit'
  }
}

export default Loading;
