import React, {Component} from 'react';
import { NavigationActions } from 'react-navigation'
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity, 
  Dimensions,
  InteractionManager,
  Icon,
  ScrollView,
  Alert,
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

import firebase from 'firebase'

const {height, width} = Dimensions.get('window');
const size = (width/3-2)

export default class AddPhotoScreen extends React.Component {
  state = {
      user: this.props.navigation.state.params.user, 
      photoUrls: [],
    }

  componentWillMount() {
    FirebaseAPI.getAllPhotoUrlsFromFbCb(this.state.user.id, this.state.user.fbAuthToken, (photoUrls) => {
      unusedPhotoUrls = photoUrls.filter((newUrl) => { return 'photoUrls' in this.state.user ? !this.state.user.photoUrls.some((oldUrl) => {
        return newUrl == oldUrl
      }) : true})

      InteractionManager.runAfterInteractions(() => {
        this.setState({photoUrls: unusedPhotoUrls})
      })
    })
  }

  addPhoto(url) {
    FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
      updatedPhotoUrls = user.photoUrls != undefined ? user.photoUrls : []
      updatedPhotoUrls.push(url)

      Alert.alert(
        ('Display this picture on your public profile?'),
        'It will be added to the end of your photo collection.',
        [
          {text: 'OK', onPress: () => {
            InteractionManager.runAfterInteractions(() => {
              FirebaseAPI.updateUser(this.state.user.uid, 'photoUrls', updatedPhotoUrls)
            })

            InteractionManager.runAfterInteractions(() => {
              FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
               this.props.navigation.state.params.cb(user)
                InteractionManager.runAfterInteractions(() => {
                  this.props.navigation.goBack();
                })
              })
            })
          }},
          {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        ],
        { cancelable: false }
      )
    })
  }

  render() {
    if(this.state.photoUrls.length != 0)
      return(
        <View style={styles.container}>  
          <ScrollView style={{flex: 1}}>
            <View style={{flex: 1, width: width}}>
            {
              this.state.photoUrls.map((url) => {
                const index = this.state.photoUrls.indexOf(url)

                if(index % 3 == 0) 
                  return (
                    <View style={{flex: 1, flexDirection: 'row', width: width, height: width/3, justifyContent: 'space-between'}}
                    key={url+'view-row'}> 
                    {
                      this.state.photoUrls.slice(index, index+3).map((url) => {
                        return (
                          <TouchableOpacity onPress={() => {this.addPhoto(url)}}
                            key={url+'touchable'}>
                            <View style={{flex: 1, flexDirection: 'row', width: size, height: size, justifyContent: 'space-between'}}
                            key={url+'single-view'}> 
                              <Image 
                              resizeMode='cover'
                              source={{uri: url}}
                              style={{width:size, height:size}} 
                              key={url+'image'} />
                            </View>
                          </TouchableOpacity>
                        ) 
                      })
                    }
                  </View>
                  )
              })
            }
            </View>
          </ScrollView>
        </View>
      )
    else
      return(
        <View style={styles.container}>  
          <ScrollView style={{flex: 1}}>
            <View style={{flex: 1, width: width, paddingLeft: 20, paddingRight: 20, paddingTop: 10,}}>
              <Text style={styles.name}>There are no photos in your albums on Facebook to use for Ice Breaker.</Text>
            </View>
          </ScrollView>
        </View>
      )
  }
}
        

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height:height,
    width:width,
    backgroundColor: '#f7fbff',
  },  
  headerContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  titleContainer: {
    backgroundColor:'#f7fbff',
  },
  bioContainer: {
    flex: 1,
    width: width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  bio: {
    flex: 1,
    width: width,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
  },
  text: {
    color: '#565656',
    fontSize: 48,
    textAlign: 'left'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 3,
    color: 'gray',
  },
  title: {
    fontSize:16,
    color: 'black',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingTop: 15,
    paddingBottom: 5,
    paddingLeft: 20,
  },
  subtitle: {
    fontSize:15,
    color: 'gray',
    textAlign: 'left'
  },
  gender: {
    fontSize:16,
    color: 'gray',
    textAlign: 'left',
    marginBottom: 5,
  },
  chatButtonContainer: {
    height: height/10, 
    justifyContent: 'flex-end', 
    alignItems: 'center'
  },
  chatButton: {
    width: width,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'green',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
  unmatchButton: {
    width: width,
    marginTop: 100,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'gray',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
});
