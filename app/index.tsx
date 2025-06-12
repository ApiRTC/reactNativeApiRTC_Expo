import { Text, View, StyleSheet, SafeAreaView } from "react-native";




import ReactNativeApiRTC from './ReactNativeApiRTC';

export default function Index() {

    function conference(ctx) {
      return <ReactNativeApiRTC />;
    }

    return (
      <SafeAreaView>
        <View style={styles.container}>
          {conference(this)}
        </View>
      </SafeAreaView>
    );
/*
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
*/
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
