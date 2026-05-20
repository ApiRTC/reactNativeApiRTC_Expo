
# Adding Background Effects (Blur & Background Image)

This guide explains how to add video background effects to your React Native ApiRTC Expo application.

---

## iOS — Background Blur via Portrait Effect

On iOS, background blur is provided by the system through the **Portrait Effect** (iOS 15+). No native code is required — the OS applies the blur directly on the camera feed before it reaches your app.

To enable it, add one of the following keys to the `infoPlist` section of `app.json`:

**Option A — Enable Portrait Effect explicitly:**
```json
"ios": {
  "infoPlist": {
    "NSCameraPortraitEffectEnabled": true
  }
}
```

**Option B — Enable VoIP mode** (also activates Portrait Effect, Studio Light, and Reactions):
```json
"ios": {
  "infoPlist": {
    "UIBackgroundModes": ["voip"]
  }
}
```

Once either key is present, iOS will show the Portrait Effect toggle in the Control Center / camera UI. The user enables or disables it manually — your app does not need to control it programmatically.

After modifying `app.json`, run `npx expo prebuild --clean` to apply the changes.

> More information: [WWDC 2021 — Capturing depth in iPhone photography](https://developer.apple.com/videos/play/wwdc2021/10047/?time=1324)
> Apple support: [Use video conferencing features on iPhone](https://support.apple.com/guide/iphone/use-video-conferencing-features-iphaa0b5671d/ios)

---

## Android — Background Blur & Background Image Replacement

Both effects use ML Kit Selfie Segmentation to separate the person from the background and apply either a Gaussian blur or a custom image. The effect is applied at the WebRTC VideoSource level, so **both the local preview and remote peers see the modified video**.

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

Copy the 2 icon files into your `src/images/svg/` directory (or wherever you keep SVG icon components):

```
src/images/svg/Blur_on.js
src/images/svg/Chevron_up.js
```

### Step 3 — JavaScript integration

Import the native module and icon components:
```javascript
import { NativeModules, Platform } from 'react-native';
const { BackgroundBlurModule } = NativeModules;

import Blur_on from './images/svg/Blur_on.js';
import Chevron_up from './images/svg/Chevron_up.js';
```

#### Define the backgrounds list (module level)

```javascript
const BACKGROUNDS = [
  {id: 'none',  label: 'None',  type: 'none'},
  {id: 'blur',  label: 'Blur',  type: 'blur'},
  {id: 'beach', label: 'Beach', type: 'image',
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

#### Add methods

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
