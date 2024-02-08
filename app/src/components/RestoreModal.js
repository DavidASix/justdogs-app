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

import axios from 'axios';
import * as c from '../constants';
import {Title, Span} from './Common'

function RestoreModal(props) {
    const { showRestoreModal, dissmissModal } = props;
    const [emailText, setEmailText] = useState('');
    const [codeText, setCodeText] = useState('');
    const [emailSubmitLoading, setEmailSubmitLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    
    onPressRestoreButton = async () => {
        let email = String(emailText)
        let code = String(codeText)
        try {
            if (!code) {
                // If user has not entered a code yet, send them an email with a new code
                setEmailSubmitLoading(true)
                try {
                    if (!email.match(c.regex.email)) throw { title: 'Invalid Email', body: 'Please enter a valid email' };
                    await axios.post(c.urls.firebase.sendRestoreCode, { email });
                    Alert.alert('Email Sent!', 'Please check your spam folder', [{ text: 'OK', onPress: () => {} }]);
                } catch(err) {
                    console.log(err);
                    throw { title: 'Email not sent', body: 'There was a problem sending the email' };
                }
            } else {
                setCodeLoading(true)
                try {
                    // If code is valid, this request will return the associated user object
                    let checkCode = await axios.post(c.urls.firebase.checkRestoreCode, { email, code });
                    const user = checkCode.data?.user
                    console.log({user})
                    await AsyncStorage.setItem('@uid', user.uid);
                    // Reset inputs and flag through a callback that ads are disabled
                    setCodeText('');
                    setEmailText('');
                    props.purchaseConfirmed();
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
                        autoCompleteType='off' />
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
