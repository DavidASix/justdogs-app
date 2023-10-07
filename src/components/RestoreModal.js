import React, {useState} from 'react';
import {
  View,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'

import axios from 'axios';
import * as c from '../constants';
import {Title, Span} from './Common'
import restoreCodeEmail from './restoreCodeEmail';

const keys = c.keys;

function RestoreModal(props) {
    const { showRestoreModal, dissmissModal } = props;
    const [emailText, setEmailText] = useState('');
    const [codeText, setCodeText] = useState('');
    const [emailSubmitLoading, setEmailSubmitLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    
    sendRecoveryEmail = (email, code) => new Promise(async (resolve, reject) => {
        const credentials = base64.encode(`api:${keys.mg_api}`)
        const config = {
                headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'multipart/form-data'
            }
        };
        const content = {
            from: `Just Dogs <JustDogs@${c.urls.mg_base}>`,
            to: email,
            subject: 'Just Dogs Recovery Code',
            text: `Thank you for your support! Your Purchase Recovery Code is: ${code}`,
            html: restoreCodeEmail(code)
        }
        try {
            let res = await axios.post(`${c.urls.mg}/messages`, content, config)
            return resolve();
        } catch (err) {
            return reject(err)
        }
    });

    onPressRestoreButton = async () => {
        let email = String(emailText)
        let code = String(codeText)
        try {
            if (!code) {
                // TODO: move this flow into a firebase cloud function
                //       The code should never live/ be generated locally
                // Create a random 5 character code
                code = [...Array(5)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
                // If user has not entered a code yet, send an email
                setEmailSubmitLoading(true)
                if (!email.match(c.regex.email)) throw { title: 'Invalid Email', body: 'Please enter a valid email' };
                try {
                    // Replace with proper req
                    await sendRecoveryEmail(email, code)
                    //await axios.post(`${c.urls.dave}requestRestoreCode`, { webkey: c.webkey, email });
                    Alert.alert('Email Sent!', 'Please check your spam folder', [{ text: 'OK', onPress: () => {} }]);
                } catch(err) {
                    console.log(err);
                    throw { title: 'Email not sent', body: 'There was a problem sending the email' };
                }
            } else {
                setCodeLoading(true)
                // Check restore code
                // If code is valid, this request will return the associated user object
                try {
                    // TODO: Replace this code with Firebase
                    //let user = await axios.post(`${c.urls.dave}checkRestoreCode`, { webkey: c.webkey, code });
                    //await AsyncStorage.setItem('@uid', user.data.uid);
                    // Replace this with a prop callback to set the variables
                    //this.setState({ showAds: false, uid: user.data.uid });
                    Alert.alert(
                        'Purchase Restored',
                        'Enjoy your Ad Free Dogs!',
                        [{ text: 'OK', onPress: () => props.dissmissModal() }]);
                } catch (err) {
                    console.log('Code Error: ', err);
                    throw { title: 'Error restoring purchase', body: 'Please retry' };
                }
            }
        } catch (err) {
            console.log('error on onPressRestoreButton: ', err);
            Alert.alert(err.title, err.body);
        } finally {
            setCodeLoading(false);
            setEmailSubmitLoading(false)
        }
    }

    renderTextInputLoading = (loading) => {
        if (loading) return <ActivityIndicator size='small' color={c.colors.accent} />;
        return <Image style={{ width: 20, height: 20 }} source={require('../images/paw.png')} />
    }

    return (
        <Modal
            visible={showRestoreModal}
            animationType='slide'
            hardwareAccelerated
            onDismiss={() => dissmissModal()}
            onRequestClose={() => dissmissModal()}
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
                        {renderTextInputLoading(emailSubmitLoading)}
                    </View>
                    <TextInput
                        style={[styles.textInput, { borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }]}
                        onChangeText={text => setEmailText(text)}
                        value={emailText}
                        placeholder='youremail@gmail.com'
                        autoCapitalize='none'
                        autoCompleteType='email'
                        keyboardType='email-address' />
                    </View>
                    <View style={styles.textInput}>
                    <View style={{ borderBottomWidth: 1, borderColor: c.colors.accent, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                        {renderTextInputLoading(codeLoading)}
                    </View>
                    <TextInput
                        style={[styles.textInput, { borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }]}
                        onChangeText={text => setCodeText(text)}
                        value={codeText}
                        placeholder='Restore Code'
                        autoCapitalize='none'
                        autoCompleteType='off'
                        keyboardType='number-pad' />
                    </View>
                    <TouchableOpacity
                        onPress={onPressRestoreButton}
                        style={[styles.textInput, { width: '50%', justifyContent: 'center' }]}>
                        <Span $dark={true} style={{ textAlign: 'center' }}>
                            {codeText ? 'Restore Purchase' : 'Submit Email'}
                        </Span>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 150, width: 200, alignSelf: 'flex-end' }}>
                    <LottieView 
                    source={require('../images/doggieTrot.json')} 
                    style={{ width: '100%', height: '100%'}}
                    autoPlay 
                    loop />
                </View>
            </View>
        </Modal>
    );
}

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
  
export default RestoreModal
