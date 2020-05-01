import React, { PureComponent } from 'react';
import { View, Text, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import * as c from './constants';

//Return a semi an darker RGB color from a seed value. Accepts darker as int between 0 and 255 to dim the color
// Darker is used to ensure that light text is readable against the BG
const randomBgColor = (seed, darker = 40) => (`rgb(
  ${Math.abs((seed % 2 ? 255 - seed % 255 : seed % 255) - darker)},
  ${Math.abs(seed % 255 - darker)},
  ${Math.abs((seed % 2 ? seed % 255 : 255 - seed % 255) - darker)})`);

// Image Item is the render component for our FlatList
export class ImageItem extends PureComponent {
  render() {
    let { image, parentLayout, zoom } = this.props;
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
            style={{ height: '100%', width: '100%' }}
            source={{ uri: image.url }}
            resizeMode={zoom ? 'cover' : 'contain'}
          />
          <View style={styles.textBox}>
            <Text style={{ color: 'white', fontSize: 18 }}>
              {c.quotes.dog[Math.floor(quoteIndex)]}
            </Text>
          </View>

        </View>
    );
  }
};

export class ListHeader extends PureComponent {
  render() {
    let { parentLayout } = this.props;
    if (!parentLayout.height) return null;
    return (
      <View style={[styles.imageItemContaier, { height: parentLayout.height, backgroundColor: '#d6d6d6' }]}>

        <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', minHeight: 200, position: 'absolute' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>
              Stroller
            </Text>
            <Text style={{ fontFamily: 'blenda', color: 'white', fontSize: 36, margin: 10, textAlign: 'center' }}>
              Just Dogs
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
}

const styles = {
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
