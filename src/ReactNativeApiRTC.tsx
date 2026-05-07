/* eslint-disable react-native/no-inline-styles */
/* globals apiRTC*/

import React, {createRef} from 'react';
import {
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Platform,
  findNodeHandle,
  NativeModules,
  Image,
  StyleSheet,
  NativeEventEmitter,
} from 'react-native';

const {AppLifecycleModule} = NativeModules;
const {BackgroundBlurModule} = NativeModules;

import {
  RTCView,
  ScreenCapturePickerView,
} from 'react-native-webrtc';

import '@apirtc/react-native-apirtc';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ReactNativeApiRTC_RPK from './ReactNativeApiRTC_RPK';

import {styles} from './Styles';

import Microphone_on from './images/svg/Microphone_on.js';
import Microphone_off from './images/svg/Microphone_off.js';
import ScreenShare_on from './images/svg/ScreenShare_on.js';
import ScreenShare_off from './images/svg/ScreenShare_off.js';
import Camera_off from './images/svg/Camera_off.js';
import Camera_on from './images/svg/Camera_on.js';
import Hangup from './images/svg/Hangup.js';
import Menu from './images/svg/Menu.js';
import Switch_camera from './images/svg/Switch_camera.js';
import Camera_record from './images/svg/Camera_record.js';
import Blur_on from './images/svg/Blur_on.js';
import Chevron_up from './images/svg/Chevron_up.js';
import Svg_bubble_speech from './images/svg/Bubble-speech.js';

type Background = {
  id: string;
  label: string;
  type: 'none' | 'blur' | 'image';
  strong?: boolean;
  imageUrl?: string;
  thumbUri?: string | null;
};

const BACKGROUNDS: Background[] = [
  {id: 'none', label: 'None', type: 'none', thumbUri: null},
  {id: 'blur', label: 'Blur', type: 'blur', strong: false, thumbUri: null},
  {id: 'blur-strong', label: 'Blur+', type: 'blur', strong: true, thumbUri: null},
  {
    id: 'beach',
    label: 'Beach',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280',
    thumbUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&q=60',
  },
  {
    id: 'mountains',
    label: 'Mountains',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280',
    thumbUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&q=60',
  },
  {
    id: 'office',
    label: 'Office',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280',
    thumbUri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&q=60',
  },
];

type State = {
  initStatus: string;
  info: string;
  connected: string;
  status: string;
  selfViewSrc: string | null;
  selfScreenSrc: string | null;
  remoteListSrc: Map<string, string>;
  remoteList: Map<string, any>;
  connectedUsersList: any[];
  selected: any;
  callId: number;
  roomName: string;
  mute: boolean;
  muteVideo: boolean;
  selectedBgEffect: string;
  videoEffectPanel: boolean;
  isApplyingBg: boolean;
  chatOpen: boolean;
  displayScreenInfoStop: boolean;
  menuOpen: boolean;
  coordX: number;
  coordY: number;
  isRecording: boolean;
  remoteMenuOpen: boolean;
  remoteIdSelected: string | null;
  newMessage: any;
  cameraIsFront: boolean;
  timer: any;
};

const initialState: State = {
  initStatus: 'Registration ongoing',
  info: '',
  connected: 'notconnected',
  status: 'pickConv',
  selfViewSrc: null,
  selfScreenSrc: null,
  remoteListSrc: new Map(),
  remoteList: new Map(),
  connectedUsersList: [],
  selected: null,
  callId: 0,
  roomName: 'defaultRoom',
  mute: false,
  muteVideo: false,
  selectedBgEffect: 'none',
  videoEffectPanel: false,
  isApplyingBg: false,
  chatOpen: false,
  displayScreenInfoStop: false,
  menuOpen: false,
  coordX: 0,
  coordY: 0,
  isRecording: false,
  remoteMenuOpen: false,
  remoteIdSelected: null,
  newMessage: null,
  cameraIsFront: true,
  timer: null,
};

export default class ReactNativeApiRTC extends React.Component<{}, State> {
  ua: any;
  connectedSession: any;
  currentCall: any;
  conversation: any;
  localStream: any;
  localScreen: any;
  chatChild: any;
  screenSharingIsStarted: boolean;
  localStreamIsPublished: boolean;
  localScreenIsPublished: boolean;
  screenCaptureView: any;

  constructor(props: {}) {
    super(props);
    this.state = initialState;
    this.ua = null;
    this.connectedSession = null;
    this.currentCall = null;
    this.conversation = null;
    this.localStream = null;
    this.localScreen = null;
    this.chatChild = null;
    this.screenSharingIsStarted = false;
    this.localStreamIsPublished = false;
    this.localScreenIsPublished = false;
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      const eventEmitter = new NativeEventEmitter();
      eventEmitter.addListener('liveCycleEvent', (event: any) => {
        console.debug('liveCycleEvent :', event.eventType);
        if (event.eventType === 'onDestroy') {
          this.hangUp();
        }
      });
    }

    if (Platform.OS === 'android') {
      AsyncStorage.getItem('videoEffect')
        .then((saved: string | null) => {
          if (saved && saved !== 'none') {
            this.setState({selectedBgEffect: saved});
          }
        })
        .catch(() => {});
    }

    this.setState({remoteListSrc: new Map(), remoteList: new Map()});

    this.ua = new apiRTC.UserAgent({
      uri: 'apzkey:myDemoApiKey',
    });

    this.setUAListeners();

    this.ua
      .register({})
      .then((session: any) => {
        this.connectedSession = session;
        this.setState({connected: 'connected'});
      })
      .catch((err: any) => {
        console.error('Error on register : ', err);
      });

    if (Platform.OS === 'ios') {
      this.screenCaptureView = createRef<any>();
    }
  }

  setUAListeners() {
    this.ua.on('ccsConnectionStatus', (event: any) => {
      switch (event.status) {
        case 'connected':
          this.setState({connected: 'connected'});
          break;
        case 'retry':
          this.setState({connected: 'reconnecting'});
          break;
        case 'disconnected':
        case 'error':
          this.setState({connected: 'disconnect'});
          break;
        default:
          console.log('ccsConnectionStatus not managed case for :', event.status);
      }
    });
  }

  joinConversation() {
    this.conversation
      .join()
      .then(() => {
        console.info('Conversation join');
        this.setState({status: 'onCall', initStatus: 'Conversation join'});
        apiRTC.Stream.createStreamFromUserMedia()
          .then((localStream: any) => {
            this.localStream = localStream;
            console.info('Update local stream');

            if (Platform.OS === 'android') {
              this.restoreVideoEffect();
            }

            if (Platform.OS === 'android') {
              AppLifecycleModule.sendInfoToAppLifecycleModule({
                localStreamReactTag: this.localStream.data._reactTag,
                localStreamTrackId: this.localStream.data._tracks[0].id,
              });
            }

            this.conversation
              .publish(localStream)
              .then(() => {
                this.localStreamIsPublished = true;
                this.setState({selfViewSrc: localStream.getData().toURL()});
              })
              .catch((err: any) => {
                console.error('Error publish stream :', err);
              });
          })
          .catch((err: any) => {
            console.error('Error on createStreamFromUserMedia : ', err);
          });
      })
      .catch((err: any) => {
        console.error('Error on join :', err);
      });
  }

  setConversationListeners() {
    this.conversation.on('contactJoined', (newContact: any) => {
      let array_contact = this.state.connectedUsersList;
      array_contact.push(newContact.getUsername);
      this.setState({connectedUsersList: Object.values(array_contact)});
    });

    this.conversation.on('streamAdded', (remoteStream: any) => {
      const url = remoteStream.getData().toURL();
      const newRemoteListSrc = new Map(this.state.remoteListSrc);
      newRemoteListSrc.set(remoteStream.getId(), url);
      const newRemoteList = new Map(this.state.remoteList);
      newRemoteList.set(remoteStream.getId(), remoteStream);
      this.setState({remoteListSrc: newRemoteListSrc, remoteList: newRemoteList});
    });

    this.conversation.on('streamRemoved', (stream: any) => {
      const updateRemoteListSrc = new Map(this.state.remoteListSrc);
      updateRemoteListSrc.delete(stream.getId());
      const updateRemoteList = new Map(this.state.remoteList);
      updateRemoteList.delete(stream.getId());
      this.setState({remoteListSrc: updateRemoteListSrc, remoteList: updateRemoteList});
    });

    this.conversation.on('streamListChanged', (streamInfo: any) => {
      if (streamInfo.listEventType === 'added' && streamInfo.isRemote === true) {
        this.conversation
          .subscribeToStream(streamInfo.streamId)
          .then(() => console.info('Subscribe to stream : ' + streamInfo.streamId))
          .catch((err: any) => console.error('Error on subscribe to stream :', err));
      }
    });

    this.conversation.on('recordingAvailable', (recordingInfo: any) => {
      console.log('recordingInfo.mediaURL :', recordingInfo.mediaURL);
    });

    this.conversation.on('contactLeft', (contactLeft: any) => {
      const toDelete: string[] = [];
      this.state.remoteList.forEach((stream: any) => {
        if (contactLeft.getUsername() === stream.getContact().getUsername()) {
          toDelete.push(stream.getId());
        }
      });
      toDelete.forEach(streamId => {
        if (this.state.remoteListSrc.get(streamId)) {
          const updateRemoteListSrc = new Map(this.state.remoteListSrc);
          updateRemoteListSrc.delete(streamId);
          const updateRemoteList = new Map(this.state.remoteList);
          updateRemoteList.delete(streamId);
          this.setState({remoteListSrc: updateRemoteListSrc, remoteList: updateRemoteList});
        }
      });
    });
  }

  call = () => {
    if (this.connectedSession) {
      this.conversation = this.connectedSession.getOrCreateConversation(this.state.roomName);
      this.setConversationListeners();
      this.joinConversation();
    } else {
      console.error('Session is not connected');
    }
  };

  toggleVideoEffectPanel = () => {
    this.setState(prev => ({videoEffectPanel: !prev.videoEffectPanel}));
  };

  saveVideoEffectPreference = (effectId: string) => {
    AsyncStorage.setItem('videoEffect', effectId).catch(() => {});
  };

  restoreVideoEffect = async () => {
    const effectId = this.state.selectedBgEffect;
    if (effectId === 'none' || !this.localStream) {
      return;
    }
    const bg = BACKGROUNDS.find(b => b.id === effectId);
    if (!bg || bg.type === 'none') {
      return;
    }
    try {
      const videoTrack = this.localStream.data._tracks.find((t: any) => t.kind === 'video');
      if (!videoTrack) {
        return;
      }
      if (bg.type === 'blur') {
        await BackgroundBlurModule.enableBlur({
          streamReactTag: this.localStream.data._reactTag,
          trackId: videoTrack.id,
          strong: bg.strong === true,
        });
      } else if (bg.type === 'image') {
        await BackgroundBlurModule.enableBackgroundImage({
          streamReactTag: this.localStream.data._reactTag,
          trackId: videoTrack.id,
          imageUrl: bg.imageUrl,
        });
      }
    } catch (err) {
      console.error('Error restoring video effect:', err);
    }
  };

  applyVideoEffect = async (bg: Background) => {
    if (Platform.OS !== 'android') {
      return;
    }
    if (this.state.isApplyingBg) {
      return;
    }

    this.saveVideoEffectPreference(bg.id);
    this.setState({selectedBgEffect: bg.id});

    if (!this.localStream) {
      this.setState({videoEffectPanel: false});
      return;
    }

    this.setState({isApplyingBg: true});

    try {
      if (bg.type === 'none') {
        await BackgroundBlurModule.disableBlur();
      } else if (bg.type === 'blur') {
        const videoTrack = this.localStream.data._tracks.find((t: any) => t.kind === 'video');
        if (!videoTrack) {
          return;
        }
        await BackgroundBlurModule.enableBlur({
          streamReactTag: this.localStream.data._reactTag,
          trackId: videoTrack.id,
          strong: bg.strong === true,
        });
      } else if (bg.type === 'image') {
        const videoTrack = this.localStream.data._tracks.find((t: any) => t.kind === 'video');
        if (!videoTrack) {
          return;
        }
        await BackgroundBlurModule.enableBackgroundImage({
          streamReactTag: this.localStream.data._reactTag,
          trackId: videoTrack.id,
          imageUrl: bg.imageUrl,
        });
      }
    } catch (err) {
      console.error('Error applying video effect:', err);
    } finally {
      this.setState({isApplyingBg: false, videoEffectPanel: false});
    }
  };

  hangUp = () => {
    if (this.state.selectedBgEffect !== 'none' && Platform.OS === 'android') {
      try {
        BackgroundBlurModule.disableBlur();
      } catch (e) {
        console.warn('Error disabling video effect during hangUp:', e);
      }
      this.setState({videoEffectPanel: false});
    }

    if (this.localStream && this.localStreamIsPublished) {
      if (this.conversation) {
        this.conversation.unpublish(this.localStream);
      }
      this.localStreamIsPublished = false;
    }
    if (this.localStream) {
      this.localStream.release();
      this.localStream = null;
    }

    if (Platform.OS === 'android') {
      AppLifecycleModule.sendInfoToAppLifecycleModule({
        localStreamReactTag: 'STOPPED',
        localStreamTrackId: 'STOPPED',
      });
    }

    if (Platform.OS === 'ios') {
      ReactNativeApiRTC_RPK.sendBroadcastNeedToBeStopped();
    }

    if (this.screenSharingIsStarted) {
      this.stopScreenSharingProcess();
      this.localScreen = null;
    }

    if (this.conversation) {
      this.conversation
        .leave()
        .then(() => {
          this.cleanConversationContext();
        })
        .catch((err: any) => {
          console.error('Error on leave conversation :', err);
          this.cleanConversationContext();
        });
    }
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

  stopScreenSharingProcess = () => {
    this.setState({selfScreenSrc: null, displayScreenInfoStop: true});
    if (this.localScreen && this.localScreenIsPublished) {
      this.conversation.unpublish(this.localScreen);
      this.localScreenIsPublished = false;
    }
    if (Platform.OS === 'android') {
      this.localScreen.release();
      AppLifecycleModule.sendInfoToAppLifecycleModule({
        localScreenReactTag: 'STOPPED',
        localScreenTrackId: 'STOPPED',
      });
    }
    this.localScreen = null;
    this.screenSharingIsStarted = false;
  };

  stoppedEventListenerOnScreenStream = () => {
    this.stopScreenSharingProcess();
  };

  screenSharing = () => {
    if (this.screenSharingIsStarted) {
      if (Platform.OS === 'ios') {
        ReactNativeApiRTC_RPK.sendBroadcastNeedToBeStopped();
      }
      this.stopScreenSharingProcess();
    } else {
      if (Platform.OS === 'ios') {
        const reactTag = findNodeHandle(this.screenCaptureView.current);
        NativeModules.ScreenCapturePickerViewManager.show(reactTag);

        ReactNativeApiRTC_RPK.addListener('onScreenShare', (event: any) => {
          if (event === 'START_BROADCAST') {
            this.conversation
              .publish(this.localScreen)
              .then(() => { this.localScreenIsPublished = true; })
              .catch((err: any) => console.error(err));
          }
        });

        apiRTC.Stream.createScreensharingStream({video: true, audio: false})
          .then((localScreenShare: any) => {
            this.screenSharingIsStarted = true;
            this.localScreen = localScreenShare;
            this.setState({selfScreenSrc: this.localScreen.getData().toURL()});
            this.localScreen.on('stopped', this.stoppedEventListenerOnScreenStream);
          })
          .catch((err: any) => console.error(err));
      } else {
        apiRTC.Stream.createScreensharingStream({video: true, audio: false})
          .then((localScreenShare: any) => {
            this.screenSharingIsStarted = true;
            this.localScreen = localScreenShare;

            AppLifecycleModule.sendInfoToAppLifecycleModule({
              localScreenReactTag: this.localScreen.data._reactTag,
              localScreenTrackId: this.localScreen.data._tracks[0].id,
            });

            this.setState({selfScreenSrc: this.localScreen.getData().toURL()});
            this.conversation
              .publish(localScreenShare)
              .then(() => { this.localScreenIsPublished = true; })
              .catch((err: any) => console.error('Error on publish stream for screenShare :', err));
          })
          .catch((err: any) => console.error('Error on createScreensharingStream :', err));
      }
    }
  };

  mute = () => {
    if (!this.state.mute) {
      this.localStream.disableAudio();
      this.setState({mute: true});
    } else {
      this.localStream.enableAudio();
      this.setState({mute: false});
    }
  };

  muteVideo = () => {
    if (!this.state.muteVideo) {
      this.localStream.disableVideo();
      this.setState({muteVideo: true});
    } else {
      this.localStream.enableVideo();
      this.setState({muteVideo: false});
    }
  };

  screenDisableOK() {
    this.setState({displayScreenInfoStop: false});
  }

  menu() {
    this.setState(prev => ({menuOpen: !prev.menuOpen}));
  }

  switchCamera() {
    this.localStream
      .getData()
      .getVideoTracks()
      .forEach((track: any) => { track._switchCamera(); });
  }

  recordingManager() {
    if (!this.state.isRecording) {
      this.setState({isRecording: true});
      this.conversation.startRecording()
        .then((info: any) => console.info('startRecording', info))
        .catch((e: any) => console.error('Error while start recording : ', e));
    } else {
      this.setState({isRecording: false});
      this.conversation.stopRecording()
        .then((info: any) => console.info('stopRecording', info))
        .catch((e: any) => console.error('Error while stop recording : ', e));
    }
  }

  menuOptionRemote(index: number | null = null, value: string | null = null) {
    if (this.state.remoteMenuOpen) {
      this.setState({remoteIdSelected: null, remoteMenuOpen: false});
    } else {
      const key = this.getByValue(this.state.remoteListSrc, value!);
      this.setState({remoteIdSelected: key ?? null, remoteMenuOpen: true});
    }
  }

  getByValue(map: Map<string, string>, searchValue: string): string | undefined {
    for (const [key, value] of map.entries()) {
      if (value === searchValue) {
        return key;
      }
    }
  }

  render() {
    const setRoom = (value: string) => {
      this.state.roomName = value;
    };

    const renderApiRTCCnx = () => {
      if (this.state.status !== 'pickConv') {
        return null;
      }
      const isConnected = this.state.connected === 'connected';
      const isReconnecting = this.state.connected === 'reconnecting';
      const dotColor = isConnected ? '#34a853' : isReconnecting ? '#fbbc04' : '#ea4335';
      const label = isConnected ? 'Connected ' : isReconnecting ? 'Reconnecting… ' : 'Disconnected ';
      return (
        <View style={styles.cnxBadgeOuter}>
          <View style={styles.cnxBadge}>
            <View style={[styles.cnxDot, {backgroundColor: dotColor}]} />
          </View>
          <Text style={styles.cnxLabel}>{label}</Text>
        </View>
      );
    };

    const renderWelcomeText = () => {
      if (this.state.status !== 'pickConv') {
        return null;
      }
      return (
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeTitle}>Conference Demo</Text>
          <Text style={styles.welcomeSubtitle}>Powered by ApiRTC</Text>
          <Image
            source={{uri: 'https://apirtc.com/images/apiRTC-dark-e1540196351855.webp'}}
            style={styles.apiRtcLogo}
            resizeMode="contain"
          />
        </View>
      );
    };

    const renderPicker = () => {
      if (this.state.status !== 'pickConv') {
        return null;
      }
      return (
        <View style={styles.joinRow}>
          <TextInput
            onChangeText={val => setRoom(val)}
            style={styles.joinInput}
            placeholder="Conference name"
            placeholderTextColor="#8a9bb0"
          />
          <TouchableOpacity style={styles.joinBtn} onPress={this.call}>
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderFooter = () => {
      if (this.state.status !== 'pickConv') {
        return null;
      }
      return (
        <Text style={styles.versionText}>{'ApiRTC ' + apiRTC.version}</Text>
      );
    };

    const renderSelfView = () => {
      if (this.state.status !== 'onCall') {
        return null;
      }
      return (
        <RTCView
          style={styles.selfViewLocal}
          streamURL={this.state.selfViewSrc}
          zOrder={1}
        />
      );
    };

    const renderScreenSelfView = () => {
      if (this.state.status !== 'onCall' || this.state.selfScreenSrc === null) {
        return null;
      }
      if (Platform.OS === 'ios') {
        return (
          <Image
            style={styles.selfScreenViewImg}
            source={require('./images/screenSharingOngoing.png')}
          />
        );
      }
      return (
        <RTCView
          style={styles.selfScreenView}
          streamURL={this.state.selfScreenSrc}
        />
      );
    };

    const screenCaptureInfoStop = () => {
      if (!this.state.displayScreenInfoStop) {
        return null;
      }
      return (
        <View style={styles.screenCaptureInformation}>
          <View style={styles.screenCaptureContainer}>
            <Text>Screen sharing has been stopped</Text>
            <Pressable
              style={styles.screenCaptureButton}
              onPress={() => this.screenDisableOK()}>
              <Text>OK</Text>
            </Pressable>
          </View>
        </View>
      );
    };

    const renderRemoteViews = () => {
      if (this.state.status !== 'onCall') {
        return null;
      }
      const count = this.state.remoteListSrc.size;
      if (count === 0) {
        return <View style={styles.remoteContainer} />;
      }
      const streams = Array.from(this.state.remoteListSrc.values());
      if (count <= 2) {
        return (
          <View style={[styles.remoteContainer, {flexDirection: 'column'}]}>
            {streams.map((value, index) => (
              <TouchableOpacity
                key={index}
                style={styles.remoteViewHalf}
                onLongPress={() => this.menuOptionRemote(index, value)}>
                <RTCView
                  streamURL={value}
                  style={{width: '100%', height: '100%'}}
                  objectFit="cover"
                  zOrder={1}
                />
              </TouchableOpacity>
            ))}
          </View>
        );
      }
      return (
        <View style={styles.remoteContainer}>
          <ScrollView style={styles.scollView}>
            <View style={styles.remoteContainerFlex}>
              {streams.map((value, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.remoteViewGrid}
                  onLongPress={() => this.menuOptionRemote(index, value)}>
                  <RTCView
                    streamURL={value}
                    style={{width: '100%', height: '100%'}}
                    objectFit="cover"
                    zOrder={1}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    };

    const renderButtons = () => {
      if (this.state.status !== 'onCall') {
        return null;
      }
      return (
        <View style={styles.renderButton}>
          <TouchableOpacity
            style={[
              styles.renderButtonComponent,
              {backgroundColor: '#1D1F20', borderColor: '#313335', borderWidth: 2},
            ]}
            onPress={() => this.menu()}>
            <View style={styles.svgButton}>
              <Menu />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.renderButtonComponent}
            onPress={() => this.mute()}>
            <View style={styles.svgButton}>
              {this.state.mute ? <Microphone_off /> : <Microphone_on />}
            </View>
          </TouchableOpacity>
          <View style={styles.ctrlGroup}>
            <TouchableOpacity
              style={[
                styles.renderButtonComponent,
                Platform.OS === 'android' && styles.ctrlGroupVideoBtn,
              ]}
              onPress={() => this.muteVideo()}>
              <View style={styles.svgButton}>
                {this.state.muteVideo ? <Camera_off /> : <Camera_on />}
              </View>
            </TouchableOpacity>
            {Platform.OS === 'android' && (
              <TouchableOpacity
                style={[
                  styles.chevronBtn,
                  this.state.videoEffectPanel && styles.chevronBtnOpen,
                ]}
                onPress={() => this.toggleVideoEffectPanel()}>
                <View style={styles.svgButton}>
                  <Chevron_up />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.renderButtonComponent}
            onPress={() => this.screenSharing()}>
            <View style={styles.svgButton}>
              {this.state.selfScreenSrc ? <ScreenShare_on /> : <ScreenShare_off />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.renderButtonComponent}
            onPress={() => this.setState(prev => ({chatOpen: !prev.chatOpen}))}>
            <View style={styles.svgButton}>
              <Svg_bubble_speech />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.renderButtonComponent, {backgroundColor: '#FF6056'}]}
            onPress={() => this.hangUp()}>
            <View style={styles.svgButton}>
              <Hangup />
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    const renderVideoEffectPanel = () => {
      if (Platform.OS !== 'android' || this.state.status !== 'onCall') {
        return null;
      }
      if (!this.state.videoEffectPanel) {
        return null;
      }
      return (
        <>
          <TouchableOpacity
            style={styles.panelOverlay}
            activeOpacity={1}
            onPress={() => this.setState({videoEffectPanel: false})}
          />
          <View style={styles.videoEffectPanel}>
            <Text style={styles.panelTitle}>Video background</Text>
            <View style={styles.bgOptionsGrid}>
              {BACKGROUNDS.map(bg => (
                <TouchableOpacity
                  key={bg.id}
                  style={[
                    styles.bgOption,
                    this.state.selectedBgEffect === bg.id && styles.bgOptionActive,
                  ]}
                  onPress={() => this.applyVideoEffect(bg)}
                  disabled={this.state.isApplyingBg}>
                  {bg.id === 'none' && (
                    <Text style={styles.bgOptionNoneText}>✕</Text>
                  )}
                  {bg.type === 'blur' && (
                    <View style={{width: 32, height: 32}}>
                      <Blur_on />
                    </View>
                  )}
                  {bg.thumbUri && (
                    <Image
                      source={{uri: bg.thumbUri}}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  )}
                  <Text
                    style={[
                      styles.bgOptionLabel,
                      bg.thumbUri ? styles.bgOptionLabelOverlay : null,
                    ]}>
                    {bg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {this.state.isApplyingBg && (
              <Text style={styles.bgApplyingText}>Applying…</Text>
            )}
          </View>
        </>
      );
    };

    const renderDialog = () => {
      if (this.state.status !== 'onCall' || !this.state.menuOpen) {
        return null;
      }
      return (
        <View style={styles.dialogContainer}>
          <View style={styles.dialogBox}>
            <TouchableOpacity
              onPress={() => this.switchCamera()}
              style={styles.touchDialog}>
              <View style={styles.contentDialogCountainer}>
                <View style={styles.svgDialog}>
                  <Switch_camera />
                </View>
                <View style={styles.testDialog}>
                  <Text style={{color: '#BBCCDD'}}>Switch camera</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.recordingManager()}
              style={styles.touchDialog}>
              <View style={styles.contentDialogCountainer}>
                <View style={styles.svgDialog}>
                  <Camera_record />
                </View>
                <View style={styles.testDialog}>
                  <Text style={{color: '#BBCCDD'}}>
                    {this.state.isRecording ? 'Stop recording' : 'Start recording'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    const menuOptionRemote = () => {
      if (!this.state.remoteMenuOpen) {
        return null;
      }
      return (
        <TouchableOpacity
          onPress={() => this.menuOptionRemote()}
          style={styles.behindMenuRemoteContainer}>
          <View style={styles.menuRemoteContainer}>
            <TouchableOpacity style={styles.touchDialog}>
              <View style={styles.contentDialogCountainer}>
                <View style={styles.testDialog}>
                  <Text style={{color: '#BBCCDD'}}>Remote Control menu</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    };

    const screenCapturePickerView = () => {
      if (Platform.OS !== 'ios') {
        return null;
      }
      return <ScreenCapturePickerView ref={this.screenCaptureView} />;
    };

    return (
      <View style={styles.container}>
        {screenCapturePickerView()}
        {menuOptionRemote()}
        {renderWelcomeText()}
        {renderApiRTCCnx()}
        {renderPicker()}
        {renderFooter()}
        {renderRemoteViews()}
        {renderButtons()}
        {renderVideoEffectPanel()}
        {renderDialog()}
        {renderSelfView()}
        {renderScreenSelfView()}
        {screenCaptureInfoStop()}
      </View>
    );
  }
}
