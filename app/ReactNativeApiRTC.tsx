import React, {createRef}  from 'react';
import {
    Text,
    View,
    TextInput,
    Button,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
  } from 'react-native';

import {
    RTCView,
} from 'react-native-webrtc';

import '@apirtc/react-native-apirtc';

import {styles} from './Styles';

import Microphone_on from './images/svg/Microphone_on.js';
import Microphone_off from './images/svg/Microphone_off.js';
import Camera_off from './images/svg/Camera_off.js';
import Camera_on from './images/svg/Camera_on.js';
import Hangup from './images/svg/Hangup.js';


const initialState = {
  initStatus: 'Registration ongoing',
  info: '',
  connected: 'notconnected',
  status: 'pickConv',
  selfScreenSrc: null,
  remoteListSrc: new Map(),
  remoteList: new Map(),
  connectedUsersList: [],
  roomName: 'defaultRoom',
  userName: 'defaultUserName',
  displayScreenInfoStop: false,
  displayWaitingModerationInfo : false,
  mute: false, // --| Use for mute state and switch state
  muteVideo: false, // --|
};

export default class ReactNativeApiRTC extends React.Component {
  ua: apiRTC.UserAgent | null;
  apiKey: string;
  connectedSession: apiRTC.Session | null;
  currentCall: apiRTC.Call | null;
  conversation: apiRTC.Conversation | null;
  localStream: apiRTC.Stream | null;
  localStreamIsPublished: boolean;

  constructor(props) {
    super(props);

    this.ua = null;
    this.apiKey = 'myDemoApiKey';
    this.state = initialState;
    this.connectedSession = null;
    this.currentCall = null;
    this.conversation = null;
    this.localStream = null;
    this.localStreamIsPublished = false; //Boolean to know if local stream is published
  }

  componentDidMount() {
    apiRTC.setLogLevel(10);
    console.log('ReactNativeApiRTC component mounted');
    
    this.setState({remoteListSrc: new Map(), remoteList: new Map()});

    this.ua = new apiRTC.UserAgent({
        uri: 'apzkey:' + this.apiKey, 
    });

    this.setUAListeners();

    var registerInformation = {};
    this.ua
        .register(registerInformation)
        .then(session => {
          this.connectedSession = session;
          this.setState({connected: 'connected'}); //This will enable render to display correct connexion status
        })
        .catch(err => {
            console.error('Error on register : ', err);
        });
  }

  setUAListeners() {
    this.ua.on('ccsConnectionStatus', event => {
      console.debug('ccsConnectionStatus : ', event);
      switch (event.status) {
        case 'connected':
          console.debug('connected : ', event);
          this.setState({connected: 'connected'}); //This will enable render to display correct connexion status
          break;
        case 'retry':
          console.debug('reconnecting : ', event);
          this.setState({connected: 'reconnecting'}); //This will enable render to display correct connexion status
          break;
        case 'disconnected':
          console.debug('disconnect : ', event);
          this.setState({connected: 'disconnect'}); //This will enable render to display correct connexion status
          break;
        case 'error':
          console.debug('error : ', event);
          this.setState({connected: 'disconnect'}); //This will enable render to display correct connexion status
          break;
        default:
          console.log(
            'ccsConnectionStatus not managed case for :',
            event.status,
          );
      }
    });
  }

  joinConversation() {

    console.info('Click on join Conversation');

    this.conversation
        .join()
        .then(() => {
        console.info('Conversation join');
        this.setState({status: 'onCall'});
        this.setState({initStatus: 'Conversation join'});
        apiRTC.Stream.createStreamFromUserMedia()
            .then(localStream => {
            this.localStream = localStream;
            console.info('Update local stream');
            this.setState({selfViewSrc: localStream.getData().toURL()});

            this.conversation
                .publish(localStream)
                .then(pubStream => {
                  this.localStreamIsPublished = true;
                //this.setState({selfViewSrc: localStream.getData().toURL()});
                })
                .catch(err => {
                  console.error('Error publish stream :', err);
                });
            })
            .catch(err => {
              console.error('Error on createStreamFromUserMedia : ', err);
            });
        })
        .catch(err => {
        console.error('Error on join :', err);
        });
  }

  setConversationListeners() {

    this.conversation.on('contactJoined', newContact => {
      console.info('REACT - Contact list change');
      let array_contact = this.state.connectedUsersList;
      array_contact.push(newContact.getUsername);
      this.setState({connectedUsersList: array_contact});
      this.setState({
        connectedUsersList: Object.values(this.state.connectedUsersList),
      });
    });

    this.conversation.on('streamAdded', remoteStream => {
      let remoteStream_rtcView = remoteStream.getData().toURL();

      //set remote stream map
      this.setState({
        remoteListSrc: this.state.remoteListSrc.set(
          remoteStream.getId(),
          remoteStream_rtcView,
        ),
      });
      this.setState({
        remoteList: this.state.remoteList.set(
          remoteStream.getId(),
          remoteStream,
        ),
      });
    });

    this.conversation.on('streamRemoved', stream => {
      let updateRemoteListSrc = new Map(this.state.remoteListSrc);
      updateRemoteListSrc.delete(stream.getId());
      this.setState({remoteListSrc: updateRemoteListSrc});

      let updateRemoteList = new Map(this.state.remoteList);
      updateRemoteList.delete(stream.getId());
      this.setState({remoteList: updateRemoteList});
    });

    this.conversation.on('streamListChanged', streamInfo => {

      if (
        streamInfo.listEventType === 'added' &&
        streamInfo.isRemote === true
      ) {
        this.conversation
          .subscribeToStream(streamInfo.streamId)
          .then(() =>
            console.info('Subscribe to stream : ' + streamInfo.streamId),
          )
          .catch(err => {
            console.error('Error on subscribe to stream :', err);
          });
      }
    });

    this.conversation.on('contactLeft', contactLeft => {
      let toDelete = [];
      this.state.remoteList.forEach(stream => {
        if (contactLeft.getUsername() === stream.getContact().getUsername()) {
          toDelete.push(stream.getId());
        }
      });
      toDelete.forEach(streamId => {
        if (this.state.remoteListSrc.get(streamId)) {
          let updateRemoteListSrc = new Map(this.state.remoteListSrc);
          updateRemoteListSrc.delete(streamId);
          this.setState({remoteListSrc: updateRemoteListSrc});

          let updateRemoteList = new Map(this.state.remoteList);
          updateRemoteList.delete(streamId);
          this.setState({remoteList: updateRemoteList});
        }
      });
    });
  }
  
  call = () => {
    console.debug('Call button pressed');
    //on video call
    if (this.connectedSession) {
      this.conversation = this.connectedSession.getOrCreateConversation(this.state.roomName);
      this.setConversationListeners();
      this.joinConversation();
    } else {
      console.error('Session is not connected : check your network connection');
    }
  };

  hangUp = () => {
    if (this.localStream && this.localStreamIsPublished) {
      this.conversation.unpublish(this.localStream);
      this.localStreamIsPublished = false;
    }
    if (this.localStream) {
      this.localStream.release();
      this.localStream = null;
    }

    this.conversation
      .leave()
      .then(() => {
        this.cleanConversationContext();
      })
      .catch(err => {
        console.error('Error on leave conversation :', err);
        this.cleanConversationContext();
      });
  };

  cleanConversationContext = () => {
    this.setState({
      selfScreenSrc: null,
      status: 'pickConv',
      remoteListSrc: new Map(),
      connectedUsersList: [],
    });
    this.conversation.destroy();
    this.conversation = null;
  };

  mute = () => {
    if (this.state.mute === false) {
      console.info('Mute');
      this.localStream.disableAudio();
      this.setState({mute: true});
    } else {
      console.info('Unmute');
      this.localStream.enableAudio();
      this.setState({mute: false});
    }
  };

  muteVideo = () => {
    if (this.state.muteVideo === false) {
      console.info('MuteVideo');
      this.localStream.disableVideo();
      this.setState({muteVideo: true});
    } else {
      console.info('UnmuteVideo');
      this.localStream.enableVideo();
      this.setState({muteVideo: false});
    }
  };

  render() {

    function setRoom(ctx, value) {
        if (value.includes(ctx.apiKey + ':')) {
            //console.debug('RoomName include apikey: ' + value);
            ctx.state.roomName = value.split(":").pop();
            //console.debug('RoomName is set to : ' + ctx.state.roomName);
        } else {
            //console.debug('RoomName is ok : ' + value);
            ctx.state.roomName = value;
        }
    }

    function renderApiRTCCnx(ctx) {
      if (ctx.state.connected === 'connected') {
        return (
          <Text>
            {' ApiRTC connection status : OK'}
          </Text>
        );
      } else if (ctx.state.connected === 'reconnecting') {
        return (
          <Text>
            {' ApiRTC connection status : reconnecting'}
          </Text>
        );
      } else {
        return (
          <Text>
            {' ApiRTC connection status : not connected'}
          </Text>
        );
      }
    }

    function renderPicker(ctx) {
        if (ctx.state.status !== 'pickConv') {
          return null;
        }
        return (
        <View style={{flexDirection: 'row'}}>
            <TextInput
            onChangeText={val => setRoom(ctx, val)}
            //style={styles.input}
            placeholder={' Enter your Conference name'}
            />
            <Button
            onPress={ctx.call}
            title="Join Conference"
            color="#0080FF"
            accessibilityLabel="Join Conference"
            />
        </View>
        );
    }

    function renderRemoteViews(ctx) {
      if (ctx.state.status !== 'onCall') {
        return null;
      }
      return (
        <View style={styles.remoteContainer}>
          <ScrollView style={[styles.scollView, {flexGrow: 1}]}>
            <View style={styles.remoteContainerFlex}>
              {renderRemoteView(ctx)}
            </View>
          </ScrollView>
        </View>
      );
    }

    function renderRemoteView(ctx) {

      if (ctx.state.remoteListSrc.size === 0) {
        return null;
      }

      return Array.from(ctx.state.remoteListSrc.values()).map(
        (value, index) => (
          <TouchableOpacity
            key={index}
            style={styles.remoteView}
            onLongPress={evt => ctx.menuOptionRemote(index, value, evt)}>
            <RTCView
              style={{ width: "100%", height: "100%" }}
              streamURL={value}
              //style={{width: '100%', height: '100%'}}
            />
          </TouchableOpacity>
        ),
      );
    }

    function renderSelfView(ctx) {
      if (ctx.state.status !== 'onCall') {
        return null;
      }
      return (
        <RTCView
          style={styles.selfViewLocal}
          //mirror={true}
          //objectFit={'cover'}
          streamURL={ctx.state.selfViewSrc}
          zOrder={99}
        />
      );
    }

    function renderMuteButton(ctx) {
      if (ctx.state.mute === false) {
        return <Microphone_on />;
      }
      return <Microphone_off />;
    }

    function renderMuteVideoButton(ctx) {
      if (ctx.state.muteVideo === false) {
        return <Camera_on />;
      }
      return <Camera_off />;
    }

    function renderButtons(ctx) {
      if (ctx.state.status !== 'onCall') {
        return null;
      }
      return (
        <View style={styles.renderButton}>
          <TouchableOpacity
            style={styles.renderButtonComponent}
            onPress={() => {
              ctx.mute();
            }}>
            <View style={styles.svgButton}>{renderMuteButton(ctx)}</View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.renderButtonComponent}
            onPress={() => {
              ctx.muteVideo();
            }}>
            <View style={styles.svgButton}>{renderMuteVideoButton(ctx)}</View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.renderButtonComponent, {backgroundColor: '#FF6056'}]}
            onPress={() => {
              ctx.hangUp();
            }}>
            <View style={styles.svgButton}>
              <Hangup />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    function renderFooter(ctx) {
      if (ctx.state.status !== 'pickConv') {
        return null;
      }
      return (
        <View style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              bottom: -5,
              borderBottomColor: 'black',
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
          <Text>
            {'\n'}
            {' ApiRTC version is :' + apiRTC.version}
            {'\n'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {renderApiRTCCnx(this)}
        {renderPicker(this)}
        {renderFooter(this)}
        {renderRemoteViews(this)}
        {renderButtons(this)}
        {renderSelfView(this)}
      </View>
    );
  }
}
