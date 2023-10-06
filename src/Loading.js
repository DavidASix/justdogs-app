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
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfiniteScroll from './InfiniteScroll';
import axios from 'axios';
import * as c from './constants';
import {Title, Span} from './components/'

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: false,
      loading: true,
      showAds: true,
      showCollectEmailModal: false,
      showRestoreModal: false,
      emailText: '',
      emailSubmitLoading: false,
      codeText: '',
      codeLoading: false
     };
    this.items = ['com.dave6.www.stroller.justdogs.noads', 'com.dave6.www.stroller.justdogs.beer'];
    this.purchaseListener = null;
    this.purchaseErrorListener = null;
  }

  async componentDidMount() {
    // Init IAP and get purchasable items
    /*
    try {
      await RNIap.initConnection();
      const products = await RNIap.getProducts(this.items);
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
    } catch (err) {
      console.log(' Comp mount Err: ,', err);
    } finally {
      this.setState({ loading: false });
    }
    */
   this.setState({ loading: false });
  }


  componentWillUnmount() {
    /*
    if (this.purchaseListener) this.purchaseListener.remove();
    this.purchaseListener = null;
    if (this.purchaseErrorListener) this.purchaseErrorListener.remove();
    this.purchaseErrorListener = null;
    */
  }


  onPressSubmitEmailCollection = async () => {
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
        this.setState({ emailSubmitLoading: false, showCollectEmailModal: false });
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

  onPressRestoreButton = async () => {
    let email = String(this.state.emailText)
    let code = String(this.state.codeText)
    console.log(code);
    try {
      if (!code) {
        // If user has not entered a code yet, send an email
        this.setState({ emailSubmitLoading: true });
        if (!email.match(c.regex.email)) throw { title: 'Invalid Email', body: 'Please enter a valid email' };
        try {
          await axios.post(`${c.urls.dave}requestRestoreCode`, { webkey: c.webkey, email });
          Alert.alert('Email Sent!', 'Please check your spam folder', [{ text: 'OK', onPress: () => {} }]);
        } catch {
          throw { title: 'Invalid Email', body: 'Please enter a valid email' };
        }
      } else {
        this.setState({ codeLoading: true });
        // Check restore code
        // If code is valid, this request will return the associated user object
        try {
          let user = await axios.post(`${c.urls.dave}checkRestoreCode`, { webkey: c.webkey, code });
          await AsyncStorage.setItem('@uid', user.data.uid);
          this.setState({ showAds: false, uid: user.data.uid });
          Alert.alert(
            'Purchase Restored',
            'Enjoy your Ad Free Dogs!',
            [{ text: 'OK', onPress: () => this.setState({ showRestoreModal: false }) }]);
        } catch (err) {
          console.log('Code Error: ', err);
          throw { title: 'Error restoring purchase', body: 'Please retry' };
        }
      }
    } catch (err) {
      console.log('error on onPressRestoreButton: ', err);
      Alert.alert(err.title, err.body);
    } finally {
      this.setState({ codeLoading: false, emailSubmitLoading: false });
    }
  }

  renderLoading() {
      if (this.state.loading) return (
        <>
          <Image source={require('./images/logo.png')} style={{ marginTop: 25, height: 200, width: 200 }} />
          <ActivityIndicator size='large' color={c.colors.accent} style={{ position: 'absolute', bottom: 10 }} />
        </>
      );
      return <InfiniteScroll showAds={this.state.showAds} restorePuchase={() => this.setState({ showRestoreModal: true })}/>
  }

  renderTextInputLoading(loading) {
    if (loading) return <ActivityIndicator size='small' color={c.colors.accent} />;
    return <Image style={{ width: 20, height: 20 }} source={require('./images/paw.png')} />
  }

  renderModals() {
    return (
      <>
        <Modal
          visible={this.state.showCollectEmailModal}
          animationType='slide'
          hardwareAccelerated
          onDismiss={() => Alert.alert('Email is required', 'An email is required to ensure we can restore your purchase')}
          onRequestClose={() => Alert.alert('Email is required', 'An email is required to ensure we can restore your purchase')}
          transparent>
          <View style={styles.modalStyle}>
            <View style={{ borderBottomWidth: 1, borderColor: '#d6d6d6', paddingBottom: 10 }}>
              <Title $dark={true}>
                Thank you!
              </Title>
              <Span $dark={true} style={{ fontSize: 12, textAlign: 'center' }}>
                Your purchase helps support an independent developer
              </Span>
            </View>

            <View style={{ width: '100%', justif: 'center', alignItems: 'center' }}>
              <View style={{ margin: 5 }}>
                <Span $dark={true} style={{ fontSize: 14, margin: 5 }}>
                  As Just Dogs does not use accounts to track users if you switch devices or reset your phone your purchase may be lost.
                </Span>
                <Span $dark={true} style={{ fontSize: 14, margin: 5 }}>
                  To ensure we are able to restore your purchase please enter your email below.
                </Span>
                <Span $dark={true} style={{ fontSize: 14, margin: 5 }}>
                  Just Dogs will <Span style={{ fontSize: 14, color: 'red' }}>never</Span> send you spam or sell your email.
                </Span>
              </View>
              <View style={styles.textInput}>
                <View style={{  borderBottomWidth: 1, borderColor: c.colors.accent, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                  {this.renderTextInputLoading(this.state.emailSubmitLoading)}
                </View>
                <TextInput
                  style={[styles.textInput, { borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }]}
                  onChangeText={text => this.setState({ emailText: text })}
                  value={this.state.emailText}
                  placeholder='youremail@gmail.com'
                  autoCapitalize='none'
                  autoCompleteType='email'
                  keyboardType='email-address' />
              </View>
              <TouchableOpacity
                onPress={this.onPressSubmitEmailCollection}
                style={[styles.textInput, { width: '50%', justifyContent: 'center' }]}>
                <Span $dark={true} style={{ textAlign: 'center' }}>
                  Submit
                </Span>
              </TouchableOpacity>
            </View>

            <View style={{ height: 150, width: 200, alignSelf: 'flex-end' }}>
              <LottieView 
                source={require('./images/doggieTrot.json')} 
                style={{ width: '100%', height: '100%'}}
                autoPlay 
                loop />
            </View>
          </View>
        </Modal>


        <Modal
          visible={this.state.showRestoreModal}
          animationType='slide'
          hardwareAccelerated
          onDismiss={() => this.setState({ showRestoreModal: false })}
          onRequestClose={() => this.setState({ showRestoreModal: false })}
          transparent>
          <View style={styles.modalStyle}>
            <View style={{ borderBottomWidth: 1, borderColor: '#d6d6d6', paddingBottom: 10 }}>
              <Title $dark={true}>
                Restore Purchase
              </Title>
              <Span $dark={true} style={{ fontSize: 12, textAlign: 'center' }}>
                Enter your email to restore your purchase
              </Span>
            </View>

            <View style={{ width: '100%', justif: 'center', alignItems: 'center' }}>
              <View style={{ margin: 5 }}>
                <Span $dark={true} style={{ fontSize: 14, margin: 5 }}>
                  Enter your recovery email and press submit to receive a code.
                </Span>
                <Span $dark={true} style={{ fontSize: 14, margin: 5 }}>
                  When you receive the code enter it below and press Restore Purchase.
                </Span>
              </View>
              <View style={styles.textInput}>
                <View style={{ borderBottomWidth: 1, borderColor: c.colors.accent, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                  {this.renderTextInputLoading(this.state.emailSubmitLoading)}
                </View>
                <TextInput
                  style={[styles.textInput, { borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }]}
                  onChangeText={text => this.setState({ emailText: text })}
                  value={this.state.emailText}
                  placeholder='youremail@gmail.com'
                  autoCapitalize='none'
                  autoCompleteType='email'
                  keyboardType='email-address' />
              </View>
              <View style={styles.textInput}>
                <View style={{ borderBottomWidth: 1, borderColor: c.colors.accent, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                  {this.renderTextInputLoading(this.state.codeLoading)}
                </View>
                <TextInput
                  style={[styles.textInput, { borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }]}
                  onChangeText={text => this.setState({ codeText: text })}
                  value={this.state.codeText}
                  placeholder='Restore Code'
                  autoCapitalize='none'
                  autoCompleteType='off'
                  keyboardType='number-pad' />
              </View>
              <TouchableOpacity
                onPress={this.onPressRestoreButton}
                style={[styles.textInput, { width: '50%', justifyContent: 'center' }]}>
                <Span $dark={true} style={{ textAlign: 'center' }}>
                  {this.state.codeText ? 'Restore Purchase' : 'Submit Email'}
                </Span>
              </TouchableOpacity>
            </View>

            <View style={{ height: 150, width: 200, alignSelf: 'flex-end' }}>
              <LottieView 
                source={require('./images/doggieTrot.json')} 
                style={{ width: '100%', height: '100%'}}
                autoPlay 
                loop />
            </View>
          </View>
        </Modal>
      </>
    )
  }

  render() {
    return (
      <>
        {this.renderModals()}
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
