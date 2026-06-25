import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

class ReactNativeApiRTC_RPK extends NativeEventEmitter {
  sendBroadcastNeedToBeStopped: (() => void);
  showVideoEffectsUI: (() => void);

  constructor(nativeModule: any) {
    super(nativeModule);

    this.sendBroadcastNeedToBeStopped =
      Platform.OS === 'ios' ? nativeModule.sendBroadcastNeedToBeStopped : null;
    this.showVideoEffectsUI =
      Platform.OS === 'ios' ? nativeModule.showVideoEffectsUI : null;
  }
}

export default new ReactNativeApiRTC_RPK(NativeModules.ReactNativeApiRTC_RPK);
