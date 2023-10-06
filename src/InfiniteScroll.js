import React, { Component, useEffect, useRef } from 'react';
import {
  View,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Share
} from 'react-native';
import * as RNIap from 'react-native-iap';
import axios from 'axios';

import * as c from './constants';
import { ImageItem, ListHeader } from './listComponents';
import {Span} from './components/'
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
      loading: true,
      products: false,
      showAds: true
    };
  }

  async componentDidMount() {
      try {
        /*
        try {
          // Load intersitial ads
          AdMobInterstitial.setAdUnitID(c.admob.inter);
          AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
          await AdMobInterstitial.requestAd();
        } catch {
          // Unable to load ad, no matter. Ad will not show;
        }
        */
        // Get initial images to render
        let newImage = await this.getNewUrl();
        let newImage1 = await this.getNewUrl();
        let newImage2 = await this.getNewUrl();
        let newImage3 = await this.getNewUrl();
        this.setState({ images: [...this.state.images, newImage, newImage1, newImage2, newImage3] });
      } catch {
        // Unable to get images from server, user will not be able to scroll as no images in list.
      } finally {
        this.setState({ loading: false, showAds: this.props.showAds });
      }
  }

  componentDidUpdate(prevProps) {
    //console.log('Show ads prop changed: ', prevProps.showAds !== this.props.showAds, ' this.props.showAds = ', this.props.showAds);
    if (prevProps.showAds !== this.props.showAds) this.setState({ showAds: this.props.showAds });
  }

  onPressShare = async () => {
    let appUrl = 'https://play.google.com/store/apps/details?id=com.dave6.stroller.justdogs';
    let message = `Come look at some cute dogs with me! ${appUrl}`;
    if (this.state.currentImageDisplaying !== false) message = `Check out this dog I found on Dog Scroll! ${this.state.images[this.state.currentImageDisplaying].url} See more on the app: ${appUrl}`;
    await Share.share({ message });
  }

  onPressRemoveAds = async () => {
    try {
      //await RNIap.requestPurchase('com.dave6.www.stroller.justdogs.noads', false);
    } catch (err) {
      //console.log('removeAds error: ', err);
      // Unable to complete purchase, should be handled with an alert
    }
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
      if (info.changed[0].index % 7 === 0 && this.state.showAds) {
        //console.log('Ad pushed to stack');
        this.setState({ maxViewed: info.changed[0].index, images: [...images, 'largeBanner'] });
      } else {
        let  newImage = await this.getNewUrl();
        this.setState({ maxViewed: info.changed[0].index, images: [...images, newImage] });
      }

      // Every 25 images show an interstitial ad
      if (info.changed[0].index % 19 === 0 && this.state.showAds) {
        return;
        try {
          //await AdMobInterstitial.requestAd();
        } catch {
          //console.log('Error getting ad', err);
          // Unable to get add from server, showAd will fail and nott display
        } finally {
          //AdMobInterstitial.showAd();
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
            {/*<AdMobBanner
                adSize="mediumRectangle"
                adUnitID={c.admob.mRec}
                testDevices={[AdMobBanner.simulatorId]}
                />*/}
          </View>

          <View style={styles.textBox}>
            <Span>
              Viewing ads helps support individual app developers. Thank you!
            </Span>
          </View>
        </View>
      );
    }
    return <ImageItem index={i} image={item} parentLayout={this.state.pageLayout} zoom={zoom} />;
  }

  renderBottomAd() {
    if (this.state.showAds) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', height: 51, width: '100%', borderTopWidth: 1 }}>
          <Image
            source={require('./images/logo.png')}
            resizeMode='contain'
            style={{ height: '100%', width: '100%', position: 'absolute' }} />
          {/*<AdMobBanner
            adSize='banner'
            adUnitID={c.admob.banner}
            testDevices={[AdMobBanner.simulatorId]}
            />*/}
        </View>
      );
    }
  }

  renderNoAdsButton() {
    if (this.state.showAds) {
      return (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={this.onPressRemoveAds}>
            <Image
              style={{ width: '85%', height: '85%' }}
              source={require('./images/noads.png')}
              />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={this.props.restorePuchase}>
            <Image
              style={{ width: '80%', height: '80%' }}
              source={require('./images/restorePurchase.png')}
              />
          </TouchableOpacity>
        </>
      );
    }
  }

  render() {
    let { pageLayout, images, currentImageDisplaying, loading, zoom } = this.state;
    if (loading) {
      return (
        <View style={{ width: '100%', height: '100%', paddingTop: 25, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('./images/logo.png')}
            style={{ height: 200, width: 200 }} />
            <ActivityIndicator size='large' color='red' style={{ position: 'absolute', bottom: 10 }} />
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
                  source={require('./images/share.png')}
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
              {this.renderNoAdsButton()}
            </View>

          </View>
          {this.renderBottomAd()}
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
