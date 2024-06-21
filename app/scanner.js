
import { useState, useRef, createContext, useContext, useEffect } from 'react';
import { Button, TextInput, TouchableOpacity, Text, View, ToastAndroid, Linking, Modal, FlatList} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import JWT, { SupportedAlgorithms } from "expo-jwt";
import ScannedItem from './../components/scannedItem';
import CSVDataHandler from '../data/csvDataHandler';
import styles from './../styles/styles';

const AppContext = createContext();
const attendeesFileUri = FileSystem.documentDirectory + 'Attendence.csv';
const dataHandler = new CSVDataHandler(attendeesFileUri);

export default function App() {
  const [scannedList, setScannedList] = useState([]);
  const [secretKey, setSecretKey] = useState('TechnicalTeam')
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [overlayColor, setOverlayColor] = useState(null);

  const lastScannedTime = useRef(0);
  const SCAN_DELAY = 1500;
  const flatListRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const data = await dataHandler.load();
      setScannedList(data);
    }
    fetchData();
  },[])

  // Handle QR scanning and processing
  const handleQRScan = async (qr) => {
    // Delay QR Scan
    const now = Date.now();
    if(now - lastScannedTime.current < SCAN_DELAY) return;

    //Get QR data
    lastScannedTime.current = now;
    let token = qr.data;
    console.log('QR da: '+token)

    // is Valid JWT token
    let data;
    try{
      data = await JWT.decode(token, secretKey);
      console.log("💀💀💀"+data)
    } catch (e) {
      if(e.message == 'Invalid token signature'){
        ToastAndroid.show('Invalid QR', ToastAndroid.SHORT)
        setOverlayColor("red")
        setTimeout(() => setOverlayColor(null), 500);
        return;
      }
    }

    // Check if data already exists in list
    const index = scannedList.findIndex(e => e[1] === JSON.stringify(data));
    if(index>-1){
      ToastAndroid.show('Already Present', ToastAndroid.SHORT);
      setOverlayColor("red");
      setTimeout(() => setOverlayColor(null), 500);
      return;
    }
    
    // Show green overlay briefly
    setOverlayColor("green");
    setTimeout(() => setOverlayColor(null), 500); // Reset after 500ms

    // Create new row for CSV
    console.log(lastScannedTime.current);
    const dt = new Date(lastScannedTime.current).toLocaleString().replace(', ',' ');
    console.log(dt);
    const newRow = [dt, JSON.stringify(data)];

    // Update CSV file and list array 
    await dataHandler.save(newRow);
    setScannedList((list) => [...list, newRow]);
    setTimeout(()=>{  // this feels wrong, but is important to make sure re-render happens before scroll
      flatListRef.current?.scrollToEnd({ animated: true });
    },100);
    ToastAndroid.show(JSON.stringify(data).substring(0,10)+' added', ToastAndroid.SHORT);
  }
  
  return (
    <AppContext.Provider value={{isInfoVisible, setInfoVisible, secretKey, setSecretKey, attendeesFileUri}}>
      <View style={styles.container}>
        {overlayColor === "green" && <View style={styles.overlayGreen} />}
        {overlayColor === "red" && <View style={styles.overlayRed} />}
        <CamPermissionAlert />        
        <Camera handleQRScan={handleQRScan} />        
        <ScannedList scannedList={scannedList} flatListRef={flatListRef} />
        <InfoModal />
        <InfoButton />
        <ShareButton />
      </View>
    </AppContext.Provider>
  );
}

function CamPermissionAlert(){
  const [permission, requestPermission] = useCameraPermissions();
  
  useEffect(() => {
    if(permission == null) return;
    if(!permission.granted) {
      requestPermission();
    } else {
      console.log("Camera permission granted");
    }
  },[permission]);
}

function Camera({handleQRScan}){
  return (
    <CameraView 
    style={styles.camera}
    barcodeScannerSettings={{
      barcodeTypes: ["qr"],
    }}
    onBarcodeScanned={handleQRScan}>
      <View style={styles.camOverlay}/>
    </CameraView>
  )
}

function ScannedList({scannedList, flatListRef}){
  return (
    <FlatList style={{flex: 1}}
        ref={flatListRef}
          data={scannedList}
          renderItem={(data) => <ScannedItem data={data}/>}
          keyExtractor={(data,idx) => idx}
          inverted
        />
  )
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