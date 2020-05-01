import React, { Component, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Share
} from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification'
import { AdMobBanner, AdMobInterstitial } from 'react-native-admob'
import axios from 'axios';

import * as c from './constants';
import { ImageItem, ListHeader } from './listComponents';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props)
    this.viewabilityConfig = { viewAreaCoveragePercentThreshold: 85 }
    this.handleViewChange = this.handleViewChange.bind(this);

    this.state = {
      pageLayout: false,
      currentImageDisplaying: false,
      maxViewed: 0,
      images: [],
      zoom: true,
      loading: true
    };
  }

  async componentDidMount() {
      AdMobInterstitial.setAdUnitID('ca-app-pub-7620983984875887/2283824628');
      AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
      AdMobInterstitial.requestAd()
        .then(() => console.log('ad loaded'))
        .catch(error => console.log(error));
      try {
        // Get initial images to render
        let newImage = await this.getNewUrl();
        let newImage1 = await this.getNewUrl();
        let newImage2 = await this.getNewUrl();
        let newImage3 = await this.getNewUrl();
        this.setState({ images: [...this.state.images, newImage, newImage1, newImage2, newImage3] });

        // check if a user has logged in before
        let uid = await AsyncStorage.getItem('@uid')
        let { data } = await axios.post(
          `${c.urls.dave}checkUser`, { webkey: c.webkey, package: c.pn, uid });
        // Store the UID returned from the server
        await AsyncStorage.setItem('@uid', data.uid);

        // setup push notifications
        PushNotification.configure({
          onRegister: async ({ token }) => {
            await axios.post(
              `${c.urls.dave}updateFCMToken`,
              { webkey: c.webkey, package: c.pn, userId: data.id, token });
          },
          onNotification: (notification) => {
            // Notification was received
          },
          senderID: "87291361734",
          popInitialNotification: false,
          // Yes, we need permission
          requestPermissions: true
        });
      } catch (err) {
        console.log('err ', err)
      } finally {
        this.setState({ loading: false });
      }
  }

  onPressShare = async () => {
    let appUrl = 'https://play.google.com/store/apps/details?id=com.dave6.www.stroller.justdogs';
    let message = `Come look at some cute dogs with me! ${appUrl}`;
    if (this.state.currentImageDisplaying !== false) message = `Check out this dog I found on Dog Scroll! ${this.state.images[this.state.currentImageDisplaying].url} See more on the app: ${appUrl}`;
    await Share.share({ message });
  }

  async handleViewChange(info) {
    let { maxViewed, images, currentImageDisplaying } = this.state;
    // Header screen is not counted as an indexed item, so swiping from header to first dog is 0 -> 0 :
    // info.changed[0].index on header is 0, info.changed[0].index on dog 0 is 0
    // Update which image is currently being displayed. This is used to find which image to share via share button
    this.setState({ currentImageDisplaying: info.changed[0].index });
    // If a new image has been shown to the user pull down another image to add to the imageArray, thus enabling infinite scrolling
    if (maxViewed < info.changed[0].index) {
      // Every 5 images shown add an Advertisement to the image stack
      // As the image stack starts with 3 images, and begins counting at 0, the ad will show one the second page change from when it's loaded
      if (info.changed[0].index % 7 === 0) {
        //console.log('Ad pushed to stack');
        this.setState({ maxViewed: info.changed[0].index, images: [...images, 'largeBanner'] });
      } else {
        let  newImage = await this.getNewUrl();
        this.setState({ maxViewed: info.changed[0].index, images: [...images, newImage] });
      }

      // Every 25 images show an interstitial ad
      if (info.changed[0].index % 19 === 0) {
        try {
          await AdMobInterstitial.requestAd();
        } catch (err) {
          console.log('Error getting ad', err);
        } finally {
          AdMobInterstitial.showAd();
        }
      }

    }
  }

  getNewUrl() {
    // Returns a promise with a dogobject:
    // { url: 'https://random.dog/1ae6411b-8f81-438a-a793-7642a3e61128.jpg', size: intSizeInBytes }
    return new Promise(async (resolve, reject) => {
      try {
        let { data } = await axios.get(c.urls.dog);
        // recurse if an MP4 or a WebM file is found as they cannot be easily displayed in RN
        if (data.url.slice(-3) === 'mp4' || data.url.slice(-4) === 'webm') return resolve(this.getNewUrl());
        resolve({ url: data.url, size: data.fileSizeBytes });
      } catch (err) {
        return reject(err);
      }
    });
  }

  renderListItem(item, i) {
    let { pageLayout, images, zoom } = this.state;
    if (item === 'largeBanner') {
      return (
        <View style={[styles.imageItemContaier, { height: pageLayout.height, backgroundColor: '#d6d6d6' }]}>

          <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', minHeight: 200, position: 'absolute' }}>
            <Image
              source={require('./images/logo.png')}
              resizeMode='contain'
              style={{ height: '100%', width: '100%', position: 'absolute' }} />
            <AdMobBanner
              adSize="mediumRectangle"
              adUnitID='ca-app-pub-7620983984875887/1512888187'
              testDevices={[AdMobBanner.simulatorId]}
              onDidFailToReceiveAdWithError={() => console.log('no5banner')}
            />
          </View>

          <View style={styles.textBox}>
            <Text style={{ color: 'white', fontSize: 18 }}>
              These ad's pay for the developer's dog's toys!
            </Text>
          </View>
        </View>
      );
    }
    return <ImageItem index={i} image={item} parentLayout={this.state.pageLayout} zoom={zoom} />;
  }

  render() {
    let { pageLayout, images, currentImageDisplaying, loading, zoom } = this.state;
    if (loading) {
      return (
        <View style={{ width: '100%', height: '100%', paddingTop: 25, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('./images/logo.png')}
            style={{ height: 200, width: 200 }} />
        </View>
      );
    }
    return (
        <View
          style={{ height: '100%', width: '100%', backgroundColor: '#d6d6d6' }}>
          <View
            style={styles.scrollerContainer}
            onLayout={({ nativeEvent }) => this.setState({ pageLayout: nativeEvent.layout })}>

            <FlatList
              viewabilityConfig={this.viewabilityConfig}
              snapToAlignment={'top'}
              pagingEnabled
              decelerationRate={'fast'}
              onViewableItemsChanged={this.handleViewChange}
              showsVerticalScrollIndicator={false}
              data={images}
              initialNumToRender={4}
              keyExtractor={(item, index) => `id_${index}`}
              style={{ width: '100%' }}
              ListHeaderComponent={() => (<ListHeader parentLayout={this.state.pageLayout} />)}
              renderItem={({ item, i }) => this.renderListItem(item, i)} />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { width: 60, height: 60 }]}
                onPress={this.onPressShare}>
                <Image
                  style={{ width: '70%', height: '70%' }}
                  source={require('./images/share3.png')}
                  />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.setState({ zoom: !zoom })}>
                <Image
                  style={{ width: '70%', height: '70%' }}
                  source={zoom ? require('./images/minus.png') : require('./images/plus.png')}
                  />
              </TouchableOpacity>
              {/*}<TouchableOpacity
                style={styles.button}
                onPress={this.onPressRemoveAds}>
                <Image
                  style={{ width: '85%', height: '85%' }}
                  source={require('./images/noads.png')}
                  />
              </TouchableOpacity>*/}
            </View>

          </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: 51, width: '100%', borderTopWidth: 1 }}>
          <Image
            source={require('./images/logo.png')}
            resizeMode='contain'
            style={{ height: '100%', width: '100%', position: 'absolute' }} />
          <AdMobBanner
            adSize='banner'
            adUnitID='ca-app-pub-7620983984875887/2411144689'
            testDevices={[AdMobBanner.simulatorId]}
            onDidFailToReceiveAdWithError={() => console.log('no ad')}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  scrollerContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 5,
    right: 5,
    flex: 0,
    width: 60,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    marginVertical: 5,
    borderRadius: 30,
    backgroundColor: c.colors.accent,
    borderColor: 'grey',
    elevation: 10
  },
  imageItemContaier: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderColor: 'black',
  },
  textBox: {
    position: 'absolute',
    bottom: 0,
    minHeight: 50,
    width: '100%',
    backgroundColor: c.colors.accent + '75',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 10
  }
}

export default InfiniteScroll;
