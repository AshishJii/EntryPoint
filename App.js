
import { StatusBar } from 'expo-status-bar';
import { Button, Input, TextInput, TouchableOpacity, StyleSheet, Text, View, ToastAndroid, Linking, Modal, ScrollView} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useState, useRef, createContext, useContext } from 'react';
import ScannedItem from './components/scannedItem';
import { AntDesign } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import JWT, { SupportedAlgorithms } from 'expo-jwt';
import styles from './styles/styles';

const AppContext = createContext();

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedList, setScannedList] = useState([]);
  const [secretKey, setSecretKey] = useState('TechnicalTeam')
  const [isInfoVisible, setInfoVisible] = useState(false);
  const lastScannedTime = useRef(0);
  const SCAN_DELAY = 1500;
  const attendeesFileUri = FileSystem.documentDirectory + 'Attendence.txt';

  // if no camera, exit
  if(!permission){
    return <View />;
  }

  // Ask for cam access
  if(!permission.granted){
    return (
      <View style={styles.container}>
        <Text style={{textAlign: 'center'}}>Please grant permission to access camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    )
  }

  // Append item to list
  const listItem = async (qr) => {
    // Delay QR Scan
    const now = Date.now();
    if(now - lastScannedTime.current < SCAN_DELAY) return;

    //Get QR data
    lastScannedTime.current = now;
    let token = qr.data;
    console.log('QR data: '+token)

    // is Valid JWT token
    let data;
    try{
      data = JWT.decode(token, secretKey);
      console.log(data)
    } catch (e) {
      if(e.message == 'Invalid token signature'){
        ToastAndroid.show('Invalid QR', ToastAndroid.SHORT)
        return;
      }
    }

    // Check if already in list
    if(scannedList.includes(JSON.stringify(data))){
      ToastAndroid.show('Already Present', ToastAndroid.SHORT);
      return;
    }
    
    // Check for file presence
    const fileInfo = await FileSystem.getInfoAsync(attendeesFileUri);
    console.log('File Exists? '+fileInfo.exists);
    if(!fileInfo.exists){
      await FileSystem.writeAsStringAsync(attendeesFileUri, '');
      console.log('File created: '+attendeesFileUri)
    }

    //Write in file
    let fileData = await FileSystem.readAsStringAsync(attendeesFileUri, {encoding: FileSystem.EncodingType.UTF8})
    const newData = fileData + JSON.stringify(data) + '\n';
    await FileSystem.writeAsStringAsync(attendeesFileUri, newData);

    //Update list
    setScannedList((list) => {
      return [JSON.stringify(data), ...list];
    });

    //Toast🍻
    ToastAndroid.show(JSON.stringify(data).substring(0,10)+' added', ToastAndroid.SHORT);
  }
  
  return (
    <AppContext.Provider value={{isInfoVisible, setInfoVisible, secretKey, setSecretKey, attendeesFileUri}}>
      <View style={styles.container}>
        {/* Camera view */}
        <CameraView 
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={listItem}>
        </CameraView>

        {/* List view */}
        <ScrollView style={{flex: 1}}>
          {
          scannedList.length === 0 ? (
            <Text style={styles.text}>No item scanned</Text>
            ) : 
            scannedList.map((item, idx) => (
              <ScannedItem key={idx} data={item}/>
            ))
          }
        </ScrollView>

        {/* Other not important things*/}
        <InfoModal />
        <InfoButton />
        <ShareButton />
      </View>

    </AppContext.Provider>
  );
}

function InfoModal(){
  const {isInfoVisible, setInfoVisible, secretKey, setSecretKey} = useContext(AppContext);

  return (
    <Modal 
      visible={isInfoVisible}
      onRequestClose={()=> setInfoVisible(false)}
      >
      <Text style={styles.text}>
        SECRET KEY
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={setSecretKey}
        value={secretKey}
        placeholder="Enter Token here"
      />

        <Text style={styles.text}>
        Developer: 
        <Text style={{color: 'blue'}}
          onPress={() => Linking.openURL('http://www.github.com/Ashishjii')}>
          Ash
        </Text>
      </Text>
      <Button title='Go back'
        onPress={()=> setInfoVisible(false)}
        color='midnightblue' />
    </Modal>
  )
}

function InfoButton(){
  const { setInfoVisible } = useContext(AppContext);

  return (
    <TouchableOpacity style={styles.infoButton} onPress={()=> setInfoVisible(true)}>
      <AntDesign name="infocirlceo" size={24} color="white" />
    </TouchableOpacity>
  )
}

function ShareButton(){
  const { attendeesFileUri } = useContext(AppContext);

  const fileSharer = async () => {
    await Sharing.shareAsync(attendeesFileUri);
  }

  return (
    <TouchableOpacity style={styles.shareButton} onPress={fileSharer}>
      <AntDesign name="export" size={24} color="white" />
    </TouchableOpacity>
  )
}

