 import React, {Component} from 'react';
import {
  Animated,
  Alert,
  StyleSheet,
  View,
  Image,
  Button, 
  Text,
  TouchableOpacity, 
  Dimensions,
  InteractionManager,
  ActivityIndicator
} from 'react-native'

import moment from 'moment'

import { GiftedChat } from 'react-native-gifted-chat'

import * as firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');
const size = 50;

export default class ChatScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.profile.name}`,
    headerRight: (<Button title='Info' 
                    onPress={() => {navigation.navigate('Profile', {profile: navigation.state.params.profile, user: navigation.state.params.user})}} />),
  });

  componentWillMount() {
    this.state = { 
      messages: [],
      user: this.props.navigation.state.params.user,
      profile: this.props.navigation.state.params.profile, 
      reachedMax: false,
      reachedMax: false, 
      interactionsComplete: false,
    }

    const profileUid = this.props.navigation.state.params.profile.uid
    const uid = this.props.navigation.state.params.user.uid

    //Sort uid concatenation in order of greatness so every user links to the same chat
    const uidArray = [uid, profileUid]
    uidArray.sort()
    this.chatID = uidArray[0]+'-'+uidArray[1]

    this.watchChat()
  }
  
  componentWillUnmount() {
    firebase.database().ref().off()
    firebase.database().ref().child('messages').child(this.chatID).off()
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({interactionsComplete: true});
    });
  }

  getFbImageUrl(profile) {
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`
    return fbImageUrl
  }

   watchChat() {
    firebase.database().ref().child('messages').child(this.chatID)
      .orderByChild('createdAt')
      .on('value', (snap) => {
      if(this.state.chatLoaded)
        this.setState({chatLoaded: false})

      let messages = []
      snap.forEach((child) => {
        const date = moment(child.val().createdAt).format()
        messages.push({
          text: child.val().text,
          _id: child.key,
          createdAt: date,
          user: {
            _id: child.val().sender,
            name: child.val().name
          }
        })
      });
      messages.reverse()

      if(messages != this.state.messages)
        this.setState({messages: messages})      
    })
  }

  onSend(message) {
    // if(!this.state.reachedMax) {
      firebase.database().ref().child('messages').child(this.chatID)
        .push({
          text: message[0].text,
          createdAt: new Date().getTime(),
          sender: message[0].user._id,
          name: this.state.user.name 
        })
  }

  render() {
    const {
      user,
      profile
    } = this.state

  	return(
  		<View style={{flex: 1}}>
  		  <View style={styles.container}>
  		  	<View style={{flex:1, borderBottomWidth: 1, borderColor: 'gray'}} >
            <GiftedChat
              messages={this.state.messages}
              onSend={(m) => this.onSend(m)}
              renderTime={() => {}}
              user={{
                _id: this.state.user.uid,
              }} />
          </View>
  		  </View>
  		</View>
  	)
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
  },
  name: {
    backgroundColor:'white',
    fontSize: 20,   
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
});