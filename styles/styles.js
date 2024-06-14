import { StyleSheet } from "react-native";

export default styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    camera: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent', // Default transparent background
    },
    overlayGreen: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 255, 0, 0.5)', // Semi-transparent green
      zIndex: 1,
    },
    overlayRed: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 0, 0, 0.5)', // Semi-transparent red
      zIndex: 1,
    },
    infoButton: {
      position: 'absolute',
      top: 30,
      right: 10,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    shareButton: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      backgroundColor: 'blue',
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'black',
      justifyContent: 'center'
      
    },
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    }
  });