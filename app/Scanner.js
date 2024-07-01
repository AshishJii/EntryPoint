
import { useState, useRef, createContext, useContext, useEffect } from 'react';
import { Button, TextInput, TouchableOpacity, Text, View, ToastAndroid, Linking, Modal, FlatList} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import JWT from "expo-jwt";
import ScannedItem from './../components/scannedItem';
import styles from './../styles/styles';
import SQLiteDbHandler from '../data/SQLiteDbHandler';

const dbHandler = new SQLiteDbHandler();
const AppContext = createContext();

export default function Page() {
  const [scannedList, setScannedList] = useState([]);
  const [secretKey, setSecretKey] = useState('TechnicalTeam')
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [overlayColor, setOverlayColor] = useState(null);

  const lastScannedTime = useRef(0);
  const SCAN_DELAY = 1500;
  const flatListRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const d = await dbHandler.getAttendees();
      setScannedList(d);
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
    console.log('QR data: '+token)

    // is Valid JWT token
    let data;
    try{
      data = await JWT.decode(token, secretKey);
    } catch (e) {
      if(e.message == 'Invalid token signature'){
        ToastAndroid.show('Invalid QR', ToastAndroid.SHORT)
        setOverlayColor("red")
        setTimeout(() => setOverlayColor(null), 500);
        return;
      }
    }

    data = data.data; // FIXME: remove this later; it is due to bad QRs
    console.log(data)
    // TODO: Insert scanned timestamp in db
    // console.log(lastScannedTime.current);
    // const dt = new Date(lastScannedTime.current).toLocaleString().replace(', ',' ');
    // console.log(dt);
    
    // Update database
    const res = await dbHandler.updateAttendance(data);
    if(!res.success){
      ToastAndroid.show(res.error, ToastAndroid.SHORT);
      setOverlayColor("red");
      setTimeout(() => setOverlayColor(null), 500);
      return;
    }
    
    setScannedList((list) => [...list, res.data]);
    setOverlayColor("green");
    setTimeout(() => setOverlayColor(null), 500); // Reset after 500ms
    setTimeout(()=>{  // this feels wrong, but is important to make sure re-render happens before scroll
      flatListRef.current?.scrollToEnd({ animated: true });
    },100);
    // ToastAndroid.show(data+' inserted', ToastAndroid.SHORT)
  }
  
  return (
    <AppContext.Provider value={{isInfoVisible, setInfoVisible, secretKey, setSecretKey}}>
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

// TODO: Fix the share button or remove it
function ShareButton(){
  const fileSharer = async () => {
    const res = await dbHandler.exportCSV();
    await Sharing.shareAsync(res.fileUri);
  }

  return (
    <TouchableOpacity style={styles.shareButton} onPress={fileSharer}>
      <AntDesign name="export" size={24} color="white" />
    </TouchableOpacity>
  )
}