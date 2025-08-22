import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

class ReactNativeApiRTC_RPK extends NativeEventEmitter {
  sendBroadcastNeedToBeStopped: (() => void);

  constructor(nativeModule) {
    super(nativeModule);

    this.sendBroadcastNeedToBeStopped =
      Platform.OS === 'ios' ? nativeModule.sendBroadcastNeedToBeStopped : null;
  }
}

export default new ReactNativeApiRTC_RPK(NativeModules.ReactNativeApiRTC_RPK);
