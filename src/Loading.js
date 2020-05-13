import React from 'react';
import { View, Image, Platform } from 'react-native';
import InfiniteScroll from './InfiniteScroll';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification'
import axios from 'axios';
import * as c from './constants';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: false,
      loading: true,
      showAds: true
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
    console.log()
    try {
      const result = await RNIap.initConnection();
      const purchases = await RNIap.getAvailablePurchases();
      const products = await RNIap.getProducts(this.items);
      const consume = await RNIap.consumeAllItemsAndroid();
      console.log('consume ', consume)
      this.setState({ products });
    } catch (err) {
      console.log('err in iap init: ', err);
    }


    try {
      // check if a user has logged in before
      let uid = await AsyncStorage.getItem('@uid')
      console.log('old uid: ', uid);
      console.log('fuck');
      // check if stored UID is on server, if not send back a new one
      let { data } = await axios.post(`${c.urls.dave}checkUser`, { webkey: c.webkey, package: c.pn, uid });
      // Store the UID returned from the server
      await AsyncStorage.setItem('@uid', data.uid);
      console.log('new uid ', data.uid);

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
      this.setState({ uid: data.uid, showAds: !noAds.data });
      console.log('noAds: ', noAds.data);

      // Set up IAP listener for purchases
      this.purchaseListener = RNIap.purchaseUpdatedListener(async (purchase) => {
        //console.log('purchase: ', purchase);
        const receipt = purchase.transactionReceipt;
        try {
          //console.log('receipt: ', receipt);
          let uid;
          if (this.state.uid) {
            uid = this.state.uid;
          } else {
            // check if a user has logged in before
            let storedUid = await AsyncStorage.getItem('@uid')
            console.log('old uid333: ', uid);
            // check if stored UID is on server, if not send back a new one
            let { data } = await axios.post(`${c.urls.dave}checkUser`, { webkey: c.webkey, package: c.pn, uid: storedUid });
            // Store the UID returned from the server
            await AsyncStorage.setItem('@uid', data.uid);
            uid = data.uid;
          }
          if (!receipt) throw 'No Receipt!';
          console.log('USER id IS : ', uid)
          let body = {
            webkey: c.webkey,
        		uid: this.state.uid,
        		orderId: purchase.transactionId,
        		productId: purchase.productId,
        		purchaseTime: purchase.transactionDate,
        		purchaseToken: purchase.purchaseToken
        	}
          console.log(body);
          await axios.post(`${c.urls.dave}storeReceipt`, body);
          console.log('change show ads? ', purchase.productId === this.items[0]);
          if (purchase.productId === this.items[0]) {
            console.log('change show ads');
            this.setState({ showAds: false });
          }
          // Tell the store that you have delivered what has been paid for.
          // Failure to do this will result in the purchase being refunded on Android and
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
      console.log('frig');
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


  renderLoading() {
      if (this.state.loading) return <Image source={require('./images/logo.png')} style={{ marginTop: 25, height: 200, width: 200 }} />;
      return <InfiniteScroll showAds={this.state.showAds} />
  }

  render() {
    return (
      <>
        {this.renderLoading()}
      </>
    );
  }
};

export default Loading;
