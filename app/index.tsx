import { View, StyleSheet } from "react-native";
import ReactNativeApiRTC from '../src/ReactNativeApiRTC';

export default function Index() {
  return (
    <View style={styles.container}>
      <ReactNativeApiRTC />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1F20',
  },
});
