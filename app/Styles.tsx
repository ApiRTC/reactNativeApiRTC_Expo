import {StyleSheet, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        elevation: -1,
        zIndex: -1,
    },
    selfViewLocal: {
        position: 'absolute',
        width: '20%',
        height: '20%',
        bottom: 70,
        right: '0%',
        backgroundColor: 'black',
        elevation: 99,
      },
    remoteContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        backgroundColor: '#FFFFFF',
    },
    remoteContainerFlex: {
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF',
    },
    remoteView: {
        width: windowWidth / 2 - 10,
        height: windowHeight / 4 - 10,
        //backgroundColor: '#d1d1d1',
    },
    renderButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '10%',
        //backgroundColor: '#ededed',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    renderButtonComponent: {
        marginLeft: 2,
        marginRight: 2,
        borderRadius: 20,
        width: 50,
        height: 50,
        backgroundColor: '#8eabc7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgButton: {
        width: '60%',
        height: '60%',
    },
});

export {styles};