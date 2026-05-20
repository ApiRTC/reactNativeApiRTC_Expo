# ReactNativeApiRTC with Expo

Demo for usage of apiRTC.js on React Native using the Expo framework.

ApiRTC is full WebRTC API SDK provided by Apizee: https://apirtc.com/

This demo is also using react-native-webrtc: https://github.com/react-native-webrtc/react-native-webrtc

Another demo on react native without any framework usage is available here : https://github.com/ApiRTC/reactNativeApiRTC

# Welcome to your ApiRTC Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```
2. Set up your environment

  Complete informations to start can be found on this page :
    - [Set up](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local)

  We advice to start the application locally on your phone connected to your computer

  <b>IOS :</b>
  
   ```bash
        npx expo prebuild --clean
   ```
          -> this will apply all needed configuration on your projet using our plugin [https://www.npmjs.com/package/@apirtc/expo-apirtc-options-plugin](expo-apirtc-options-plugin)
   ```bash
        npx expo run:ios --device
   ```

  <b>Android :</b>

   ```bash
        npx expo run:android
   ```

  And then scan the bar code to start the application

**_Note For iOS :_**
  - replace "YOUR_TEAM_ID" with your apple development team identifier in app.json
  in ios section :
   ```bash  
      "appleTeamId": "YOUR_TEAM_ID"
   ```

  and in plugin section :
   ```bash
      ["@apirtc/expo-apirtc-options-plugin",
      {
        "enableMediaProjectionService": true,
        "appleTeamId": "YOUR_TEAM_ID"
      }]
   ```

   Don't forget to reset your project with :

   ```bash
        npx expo prebuild --clean
   ```
   
## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## ApiRTC key
For this demo we use the ApiKey "myDemoApiKey". Please register on our website to get [your own private ApiKey](https://cloud.apizee.com/register)

## Supported Features
Here is the list of supported feature depending on mobile OS

| Feature | Android | iOS |
| :---         |     :---:      |     :---:      |
| Audio / video conf   | :white_check_mark: | :white_check_mark: |
| Mute audio   | :white_check_mark: | :white_check_mark: |
| Mute video   | :white_check_mark: | :white_check_mark: |
| Switch camera (Not added in this demo)  | :white_check_mark: | :white_check_mark: |
| Media routing : SFU   | :white_check_mark: | :white_check_mark: |
| Media routing : Mesh  | :white_check_mark: | :white_check_mark: |
| Chat (Not added in this demo)    | :white_check_mark: | :white_check_mark: |
| Record (Not added in this demo)    | :white_check_mark: | :white_check_mark: |
| Screensharing | :white_check_mark: | :white_check_mark:  |
| Background blur / image | :white_check_mark: | :x: |

## Compatibility
- This demo is compatible with iOS 12+ & Android 10+
- ScreenSharing on iOS needs iOS 14+

## Demo Usage

Start application on your mobile, and connect to a room.
Then you can open [apiRTC Conference demo](https://apirtc.github.io/ApiRTC-examples/conferencing/index.html) in the browser of your computer, and connect to the same room.

## FAQ

### Requirements
* React Native needs Node.js >= 16 (Check [NVM](https://github.com/nvm-sh/nvm) if needed)

### Restrictions
* iOS screenSharing : screenSharing stream cannot be displayed locally on the application on iOS

### What are the packages that are needed in the application :

- [@apirtc/react-native-apirtc](https://www.npmjs.com/package/@apirtc/apirtc)
Our apiRTC librairie that is used to integrate WebRTC and communicate with our servers
- [react-native-webrtc](https://www.npmjs.com/package/react-native-webrtc)
Used to add webRTC support in the application
- [@config-plugins/react-native-webrtc](https://www.npmjs.com/package/@config-plugins/react-native-webrtc) :
This will add needed autorisation in your app (access to microphone/camera)
- [react-native-device-info](https://www.npmjs.com/package/react-native-device-info)
Used to get device information on React Native
- [socket.io-client](https://www.npmjs.com/package/socket.io-client)
Used to manage the connexion with our server (Websocket, HTTP polling)
- [expo-apirtc-options-plugin](https://www.npmjs.com/package/@apirtc/expo-apirtc-options-plugin)
Used to manage native interaction for feature like screensharing

You will find all the details in our package.json.

### What are the authorizations that are needed to be declared on application

In app.json, make sure to add :

    "plugins": [
      ["@config-plugins/react-native-webrtc"],
      //...
    ],

This will tell Expo to include the webrtc config plugin in the prebuild process.

### How to activate blur on camera stream on iOS :

To activate Blur on video stream, it is possible to use the iOS portrait effect feature on the application :
https://support.apple.com/guide/iphone/use-video-conferencing-features-iphaa0b5671d/ios

To activate, you will have to modify app.json by adding '"UIBackgroundModes": ["voip"]' or '"NSCameraPortraitEffectEnabled" : true' parameters 

    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["voip"],
        [...]
      }
    },

or 

    "ios": {
      "infoPlist": {
        "NSCameraPortraitEffectEnabled" : true,
        [...]
      }
    },

More information here : https://developer.apple.com/videos/play/wwdc2021/10047/?time=1324.
Voip parameter will also activate studio light and reactions feature.

## Tips for development

### Android SDK

Make sure that you have set ANDROID_HOME value

Sample for mac :
nano ~/.bash_profile
add following lines in bash_profile file:

    export ANDROID_HOME=/Users/YOUR_USER/Library/Android/sdk/  //Path to your Android SDK

    export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

source ~/.bash_profile //To apply modifications

echo $ANDROID_HOME //To check modifications

### Which node version was used for tutorial testings

NodeJs version 20.5.1 . (Check [NVM](https://github.com/nvm-sh/nvm) if you need to have several nodeJs version)

### Deactivation of Fast refresh

Fast refresh will give unwanted behavior with apiRTC, as it will create an new UserAgent and a new Session : we advice you to deactivate Fast Refresh on developper menu.

Once the app is open again, shake your device to reveal the developer menu. If you are using an emulator, press Ctrl + M for Android or Cmd ⌘ + D for iOS.

If you see Enable Fast Refresh, press it. If you see Disable Fast Refresh, dismiss the developer menu. Now try making another change.

---

## Adding Background Blur & Background Image Replacement (Android only)

Both effects use ML Kit Selfie Segmentation to separate the person from the background and apply either a Gaussian blur or a custom image. The effect is applied at the WebRTC VideoSource level, so **both the local preview and remote peers see the modified video**.

> **Platform support:** Android only. The UI (chevron + panel) is automatically hidden on iOS.

### Architecture overview

```
Camera → VideoSource → [BlurVideoProcessor | BackgroundImageProcessor] → VideoTrack → RTCView + WebRTC encoder
                                    ↑
                          ML Kit segmentation
                          Gaussian blur OR custom Bitmap compositing
                          Canvas compositing
```

### Step 1 — Enable video effects in `app.json`

The `@apirtc/expo-apirtc-options-plugin` handles all native setup automatically during `npx expo prebuild`. Make sure `enableVideoEffects` is set to `true` (it is the default):

```json
["@apirtc/expo-apirtc-options-plugin",
  {
    "enableMediaProjectionService": true,
    "enableVideoEffects": true,
    "appleTeamId": "YOUR_TEAM_ID"
  }
]
```

When you run `npx expo prebuild --clean`, the plugin automatically:
- Copies the 4 Kotlin files (`BackgroundBlurModule.kt`, `BlurVideoProcessor.kt`, `BackgroundBlurPackage.kt`, `BackgroundImageProcessor.kt`) into your Android source directory, patched with your package name
- Registers `BackgroundBlurPackage` in `MainApplication.kt`
- Adds the ML Kit `segmentation-selfie` dependency to `android/app/build.gradle`
- Adds all required Android permissions to `AndroidManifest.xml`

### Step 2 — Copy the SVG icon components

Copy the 2 icon files into your `src/images/svg/` directory:

```
src/images/svg/Blur_on.js
src/images/svg/Chevron_up.js
```

### Step 3 — JavaScript integration

In your component, import the native module and the icon components:
```javascript
import { NativeModules, Platform } from 'react-native';
const { BackgroundBlurModule } = NativeModules;

import Blur_on from './images/svg/Blur_on.js';
import Chevron_up from './images/svg/Chevron_up.js';
```

#### Define the backgrounds list (module level)

```javascript
const BACKGROUNDS = [
  {id: 'none',      label: 'None',    type: 'none'},
  {id: 'blur',      label: 'Blur',    type: 'blur'},
  {id: 'beach',     label: 'Beach',   type: 'image',
   imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280',
   thumbUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&q=60'},
  // Add more: any public image URL works
];
```

#### Add to component state

```javascript
selectedBgEffect: 'none',   // 'none' | 'blur' | <image bg id>
videoEffectPanel: false,    // whether the panel is open
isApplyingBg: false,        // download/apply in progress
```

#### Add applyVideoEffect and toggleVideoEffectPanel methods

```javascript
toggleVideoEffectPanel = () =>
  this.setState(prev => ({videoEffectPanel: !prev.videoEffectPanel}));

applyVideoEffect = async (bg) => {
  if (Platform.OS !== 'android' || !this.localStream) return;
  const videoTrack = this.localStream.data._tracks.find(t => t.kind === 'video');
  if (!videoTrack) return;
  this.setState({isApplyingBg: true});
  try {
    const base = {streamReactTag: this.localStream.data._reactTag, trackId: videoTrack.id};
    if      (bg.type === 'none')  await BackgroundBlurModule.disableBlur();
    else if (bg.type === 'blur')  await BackgroundBlurModule.enableBlur(base);
    else if (bg.type === 'image') await BackgroundBlurModule.enableBackgroundImage({...base, imageUrl: bg.imageUrl});
    this.setState({selectedBgEffect: bg.id});
  } catch (err) { console.error('Error applying video effect:', err); }
  finally { this.setState({isApplyingBg: false, videoEffectPanel: false}); }
};
```

#### Update hangUp to disable any active effect

```javascript
hangUp = () => {
  if (this.state.selectedBgEffect !== 'none' && Platform.OS === 'android') {
    try { BackgroundBlurModule.disableBlur(); } catch (e) {}
    this.setState({selectedBgEffect: 'none', videoEffectPanel: false});
  }
  // ... rest of hangUp
};
```

#### UI — chevron split button + floating panel

Replace the standalone camera `TouchableOpacity` with a grouped `View`:

```jsx
<View style={styles.ctrlGroup}>
  <TouchableOpacity style={styles.renderButtonComponent} onPress={() => this.muteVideo()}>
    {/* Camera_on / Camera_off icon */}
  </TouchableOpacity>
  {Platform.OS === 'android' && (
    <TouchableOpacity
      style={[styles.chevronBtn, this.state.videoEffectPanel && styles.chevronBtnOpen]}
      onPress={() => this.toggleVideoEffectPanel()}>
      <Chevron_up />
    </TouchableOpacity>
  )}
</View>
```

Add the floating panel in the main render (outside `renderButtons`, as an absolute overlay):

```jsx
{this.state.videoEffectPanel && Platform.OS === 'android' && (
  <>
    {/* Transparent overlay — tap outside to close */}
    <TouchableOpacity style={styles.panelOverlay} activeOpacity={1}
      onPress={() => this.setState({videoEffectPanel: false})} />
    <View style={styles.videoEffectPanel}>
      <Text style={styles.panelTitle}>Video background</Text>
      <View style={styles.bgOptionsGrid}>
        {BACKGROUNDS.map(bg => (
          <TouchableOpacity key={bg.id}
            style={[styles.bgOption, this.state.selectedBgEffect === bg.id && styles.bgOptionActive]}
            onPress={() => this.applyVideoEffect(bg)}
            disabled={this.state.isApplyingBg}>
            {/* None: ✕  |  Blur: <Blur_on />  |  Image: <Image source={{uri: bg.thumbUri}} /> */}
            <Text style={styles.bgOptionLabel}>{bg.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {this.state.isApplyingBg && <Text style={styles.bgApplyingText}>Applying…</Text>}
    </View>
  </>
)}
```

#### Required new styles (add to Styles.tsx)

| Style key | Purpose |
|---|---|
| `ctrlGroup` | `flexDirection: 'row'` wrapper for camera + chevron |
| `chevronBtn` | Narrow button (18px wide) next to camera |
| `chevronBtnOpen` | Blue tint when panel is open |
| `videoEffectPanel` | Absolute floating panel above button bar |
| `panelOverlay` | Full-screen transparent touchable to close panel |
| `bgOption` / `bgOptionActive` | Thumbnail buttons with active border |
| `bgOptionsGrid` | `flexDirection: 'row', flexWrap: 'wrap'` grid |
| `panelTitle` / `bgOptionLabel` / `bgApplyingText` | Text styles |

### Notes & requirements

- **Minimum Android API:** 21 (Android 5.0)
- **Google Play Services:** The ML Kit selfie segmentation model is downloaded on first use. An internet connection is required the first time.
- **Performance:** Segmentation runs on every 5th frame (configurable via `SEGMENTATION_INTERVAL` in `BlurVideoProcessor.kt`). The blur applies to all frames using the cached mask.
- **Image download:** The background image is downloaded once on selection on Android's native thread (no UI freeze). A loading indicator is shown during download.
- **`disableBlur()` is universal:** It clears both blur and background image processors. Use it for the "None" option and in `hangUp`.