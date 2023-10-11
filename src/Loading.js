import React from 'react';
import {
  Image,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import InfiniteScroll from './InfiniteScroll';
import axios from 'axios';
import * as c from './constants';
import RestoreModal from './components/RestoreModal';
import CollectEmailModal from './components/CollectEmailModal';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showAds: true,
      showCollectEmailModal: false,
      showRestoreModal: false,
     };
    this.purchaseListener = null;
    this.purchaseErrorListener = null;
  }

  async componentDidMount() {
    // TODO: Implement FacebookADNetwork

    // Init IAP and get purchasable items
    try {
      await RNIap.initConnection();
      // Clear out any pending purchases in the google native vendor
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      this.purchaseListener = RNIap.purchaseUpdatedListener(async (purchase) => {
          try {
            console.log('purchaseUpdatedListener', purchase);
            const receipt = purchase.transactionReceipt;
            if (!receipt) throw new Error('Could not complete transaction, no receipt');
            this.purchaseSuccessful();
            // If consumable (can be purchased again)
            // Check receipt to see if this was a consumable product
            // This call tells the store I have processed the purchase. If this is not done, the payment will refund.
            await RNIap.finishTransaction({purchase, isConsumable: false});
          } catch (err) {
            console.log('Error in purchase lisetner', err)
          }
      });

      this.purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        switch (error.code) {
          default: {
            console.log('purchaseErrorListener', error); 
            break;
          }
        }
      });

      const skus = ['com.dave6.www.stroller.justdogs.noads', 'com.dave6.www.stroller.justdogs.beer'];
      const products = await RNIap.getProducts({skus});
      console.log({products})
      this.setState({ products });
    } catch (err) {
      console.log('err in iap init: ', err);
    }
    try {
      // check if a user has logged in before
      await this.getUid();
      // TODO: Add check here for previously purchased items
    } catch (err) {
      console.log('Could not get UID')
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

  getUserRef = (uid) => new Promise(async (resolve, reject) => {
    // Returns a ref to the user document. Data obj can be accessed with .data();
    try {
      let user = null;
      const usersCollection = firestore().collection('users');
      const query = usersCollection.where('uid', '==', uid).limit(1);
      const snapshot = await query.get();
      if (!snapshot.empty) {
        user = snapshot.docs[0];
      } else {
        throw new Error('User not found');
      }
      return resolve(user);
    } catch (err) {
      return reject(err);
    }
  });

  getUid = () => new Promise(async (resolve, reject) => {
    try {
      // check if a user has logged in before
      let uid = await AsyncStorage.getItem('@uid')
      // check if stored UID is on server, if not send back a new one
      try {
        console.log('Try entered', uid)
        let user = await this.getUserRef(uid);
        console.log({user})
        user = user.data();
        uid = user.uid;
      } catch (err) {
        uid = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
        console.log('Creating user', uid)
        try {
          const usersCollection = firestore().collection('users');
          await usersCollection.add({uid});
        } catch {
          console.log('Could not store new users UID');
        }
      } finally {
        if (uid) await AsyncStorage.setItem('@uid', uid);
      }
      return resolve(uid);
    } catch (err) {
      console.log('Either could not get or set async item.')
      return reject(err);
    }
  })

   purchaseSuccessful(skus, purchase) {
      // If purchase = null, func was called in result of E_ALREADY_OWNED error to update server with previously purchased product
      console.log('Purchase Successful Called: ', skus)
      this.setState({showAds: false});
   }

  submitEmail = (email) => new Promise(async (resolve, reject) => {
    // This is a callback called by the emailCollection modal when the email is submitted
      if (!email.match(c.regex.email)) reject({ title: 'Invalid Email', body: 'Please enter a valid email' });
      try {
        let uid = await this.getUid();
        const user = await this.getUserRef(uid);
        user.ref.update({ email });
        resolve(true)
      } catch (err) {
        reject({ title: 'Server Error', body: 'Try again later' });
      }
  })

  renderLoading() {
      if (this.state.loading) return (
        <>
          <Image source={require('./images/logo.png')} style={{ marginTop: 25, height: 200, width: 200 }} />
          <ActivityIndicator size='large' color={c.colors.accent} style={{ position: 'absolute', bottom: 10 }} />
        </>
      );
      return <InfiniteScroll 
                showAds={this.state.showAds} 
                restorePuchase={() => this.setState({ showRestoreModal: true })} 
                purchaseSuccessful={(skus) => this.purchaseSuccessful(skus)} />
  }

  render() {
    return (
      <>
        <CollectEmailModal
          showCollectEmailModal={this.state.showCollectEmailModal}
          dissmissModal={() => this.setState({showCollectEmailModal: false})}
          submitEmail={(email) => submitEmail(email)} />

        <RestoreModal 
          showRestoreModal={this.state.showRestoreModal} 
          dissmissModal={() => this.setState({showRestoreModal: false})}
          purchaseConfirmed={() => this.setState({showAds: false})} />

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
    fontFamily: 'fenix',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 10,
    width: '95%',
    flex: 0,
    padding: 5,
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: 'transparent'
  }
}

export default Loading;
