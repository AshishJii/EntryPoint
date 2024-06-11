import { StyleSheet } from "react-native";

export default styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    camera: {
      flex: 1,
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