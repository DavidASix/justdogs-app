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
import * as c from '../constants';
import {Title, Span} from './Common'


function RestoreModal(props) {
    const { showCollectEmailModal, dissmissModal, submitEmail } = props;
    const [emailText, setEmailText] = useState('');
    const [emailSubmitLoading, setEmailSubmitLoading] = useState(false);

    onPressSubmit = async () => {
        setEmailSubmitLoading(false)
        let email = String(emailText)
        try {
            await submitEmail(email)
            setEmailSubmitLoading(false)
            dissmissModal()
          } 
        catch (err) {
            Alert.alert(
                err.title,
                err.body,
                [{ text: 'OK', onPress: () => this.setState({ emailSubmitLoading: false }) }]);
        }
      }

    renderTextInputLoading = (loading) => {
        if (loading) return <ActivityIndicator size='small' color={c.colors.accent} />;
        return <Image style={{ width: 20, height: 20 }} source={require('../images/paw.png')} />
    }

    return (
        <Modal
            visible={showCollectEmailModal}
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
                    {renderTextInputLoading(emailSubmitLoading)}
                </View>
                <TextInput
                    style={[styles.textInput, { borderBottomWidth: 1, borderColor: c.colors.accent, flex: 1 }]}
                    onChangeText={text => setEmailText(text) }
                    value={emailText}
                    placeholder='youremail@gmail.com'
                    autoCapitalize='none'
                    autoCompleteType='email'
                    keyboardType='email-address' />
                </View>
                <TouchableOpacity
                    onPress={onPressSubmit}
                    style={[styles.textInput, { width: '50%', justifyContent: 'center' }]}>
                    <Span $dark={true} style={{ textAlign: 'center' }}>
                        Submit
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
