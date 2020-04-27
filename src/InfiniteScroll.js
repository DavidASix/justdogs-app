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
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded
} from 'react-native-admob'
import axios from 'axios';
import * as c from './constants';

//Return a semi an darker RGB color from a seed value. Accepts darker as int between 0 and 255 to dim the color
// Darker is used to ensure that light text is readable against the BG
const randomBgColor = (seed, darker = 40) => (`rgb(
  ${Math.abs((seed % 2 ? 255 - seed % 255 : seed % 255) - darker)},
  ${Math.abs(seed % 255 - darker)},
  ${Math.abs((seed % 2 ? seed % 255 : 255 - seed % 255) - darker)})`);

// Image Item is the render component for our FlatList
const ImageItem = ({ image, parentLayout }) => {
  // Image size is used to ensure a (mostly) random quote is selected to go with the image, and that the quote would not change on a re-render (as it would with Math.random)
  let  quoteIndex = image.size % c.quotes.dog.length;
  if (!parentLayout.height) return null;
  return (
      <View style={[styles.imageItemContaier, { height: parentLayout.height, backgroundColor: randomBgColor(image.size) }]}>

        <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', minHeight: 200, position: 'absolute' }}>
          <View style={{ height: 150, width: '100%' }}>
            <LottieView source={require('./images/doggieTrot.json')} autoPlay loop />
          </View>
          <Text style={{ color: 'white', fontSize: 14, margin: 10, textAlign: 'center' }}>
            {
              image.url.slice(-3) === 'gif' ? 'This GIF will take longer to load, but it\'s worth it!' :
              image.size > 2200000 ? 'This is a larger image, so it may take longer to load. Probably pretty cute though.' :
              ''
            }
          </Text>
        </View>

        <Image
          style={{ height: '100%', width: '100%'}}
          source={{ uri: image.url }}
          resizeMode='cover'
        />

        <View style={styles.textBox}>
          <Text style={{ color: 'white', fontSize: 18 }}>
            {c.quotes.dog[Math.floor(quoteIndex)]}
          </Text>
        </View>

      </View>
  )
};

const ListHeader = ({ parentLayout }) => {
  if (!parentLayout.height) return null;
  return (
    <View style={[styles.imageItemContaier, { height: parentLayout.height, backgroundColor: '#d6d6d6' }]}>

    <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', minHeight: 200, position: 'absolute' }}>

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>
          Stroller
        </Text>
        <Text style={{ fontFamily: 'blenda', color: 'white', fontSize: 36, margin: 10, textAlign: 'center' }}>
          Only Dogs
        </Text>
      </View>

      <View style={{ height: 150, width: '100%' }}>
        <LottieView source={require('./images/doggieTrot.json')} autoPlay loop />
      </View>
    </View>

      <View style={styles.textBox}>
        <Text style={{ color: 'white', fontSize: 18 }}>
          Swipe up to get started
        </Text>
      </View>
    </View>
  );
}

class InfiniteScroll extends Component {
  constructor(props) {
    super(props)
    this.viewabilityConfig = { viewAreaCoveragePercentThreshold: 85 }
    this.handleViewChange = this.handleViewChange.bind(this);

    this.state = {
      pageLayout: false,
      currentImageDisplaying: false,
      maxViewed: 0,
      images: []
    };
  }

  async componentDidMount() {

    AdMobInterstitial.setAdUnitID('ca-app-pub-7620983984875887/2283824628');
    AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
    AdMobInterstitial.requestAd()
      .catch(error => console.log(error));
    try {
      let newImage = await this.getNewUrl();
      let newImage1 = await this.getNewUrl();
      let newImage2 = await this.getNewUrl();
      let newImage3 = await this.getNewUrl();
      this.setState({ images: [...this.state.images, newImage, newImage1, newImage2, newImage3] });
    } catch (err) {
      console.log('error in compmount')
    }
  }

  onPressShare = async () => {
    let appUrl = '';
    let message = `Come look at some cute dogs with me! ${appUrl}`;
    if (this.state.currentImageDisplaying !== false) message = `Check out this dog I found on Dog Scroll! ${this.state.images[this.state.currentImageDisplaying].url} See more on the app: ${appUrl}`;
    await Share.share({ message });
  }

  async handleViewChange(info) {
    let { maxViewed, images, currentImageDisplaying } = this.state

        console.log('Currently Displaying: ', info.changed[0].index);
        console.log('Max Displayed: ', maxViewed);
        console.log('image array is this long --> ', this.state.images.length)
        console.log('--------------------------------------------------------')
    // Header screen is not counted as an indexed item, so swiping from header to first dog is 0 -> 0 :
    // info.changed[0].index on header is 0, info.changed[0].index on dog 0 is 0
    // Update which image is currently being displayed. This is used to find which image to share via share button
    this.setState({ currentImageDisplaying: info.changed[0].index });
    // If a new image has been shown to the user pull down another image to add to the imageArray, thus enabling infinite scrolling
    if (maxViewed < info.changed[0].index) {
      // Every 5 images shown add an Advertisement to the image stack
      // As the image stack starts with 3 images, and begins counting at 0, the ad will show one the second page change from when it's loaded
      if (info.changed[0].index % 7 === 0) {
        console.log('Ad pushed to stack');
        this.setState({ maxViewed: info.changed[0].index, images: [...images, 'largeBanner'] });
      } else {
        let  newImage = await this.getNewUrl();
        this.setState({ maxViewed: info.changed[0].index, images: [...images, newImage] });
      }

      // Every 25 images show an interstitial ad
      if (info.changed[0].index % 18 === 0) {
        AdMobInterstitial.showAd()
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
        console.log('getNewUrl error: ', err);
        return reject(err);
      }
    });
  }

  renderListItem(item, i) {
    let { pageLayout, images } = this.state;
    if (item === 'largeBanner') {
      return (
        <View style={[styles.imageItemContaier, { height: pageLayout.height, backgroundColor: '#d6d6d6' }]}>

        <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', minHeight: 200, position: 'absolute' }}>

          <Text style={{ position: 'absolute' }}>
            Square Ad
          </Text>
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
    return <ImageItem index={i} image={item} parentLayout={this.state.pageLayout}/>;
  }

  render() {
    let { pageLayout, images, currentImageDisplaying } = this.state;

    return (
        <View
          style={{ height: '100%', width: '100%', backgroundColor: '#d6d6d6' }}>
          <View style={styles.scrollerContainer} onLayout={({ nativeEvent }) => this.setState({ pageLayout: nativeEvent.layout })}>
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
              style={styles.list}
              ListHeaderComponent={() => (<ListHeader parentLayout={this.state.pageLayout} />)}
              renderItem={({ item, i }) => this.renderListItem(item, i)} />

              <TouchableOpacity
                style={styles.shareButton}
                onPress={this.onPressShare}>
                <Image
                  style={{ width: '70%', height: '70%' }}
                  source={require('./images/share3.png')}
                  />
              </TouchableOpacity>

          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 51, width: '100%', borderTopWidth: 1 }}>
            <Text style={{ position: 'absolute' }}>
              Advertisement
            </Text>
            <AdMobBanner
              adSize='banner'
              adUnitID='ca-app-pub-7620983984875887/2411144689'
              testDevices={[AdMobBanner.simulatorId]}
              onDidFailToReceiveAdWithError={() => console.log('no ad')}
            />
          </View>
        </View>
    )
  }
}

const styles = {
  scrollerContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    width: '100%',
  },
  shareButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 5,
    right: 5,
    height: 60,
    width: 60,
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
