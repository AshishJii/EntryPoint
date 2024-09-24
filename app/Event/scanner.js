import { useState, useRef, createContext, useContext, useEffect } from 'react';
import { Button, TextInput, TouchableOpacity, Text, View, ToastAndroid, Modal, FlatList } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import JWT from "expo-jwt";
import { AntDesign } from '@expo/vector-icons';
import ScannedItem from '../../components/scannedItem';
import styles from '../../styles/scannerStyles';
import SQLiteDbHandler from '../../data/SQLiteDbHandler';

const dbHandler = new SQLiteDbHandler();
const AppContext = createContext();

export default function Scanner( {eventId} ) {
  // const { event } = useLocalSearchParams(); // Get the event parameter
  // const eventDetails = JSON.parse(event); // Parse the event details
  const [scannedList, setScannedList] = useState([]);
  const [secretKey, setSecretKey] = useState('TechnicalTeam'); // Set secret key from event details
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
  }, []);

  // Handle QR scanning and processing
  const handleQRScan = async (qr) => {
    const now = Date.now();
    if (now - lastScannedTime.current < SCAN_DELAY) return;

    lastScannedTime.current = now;
    let token = qr.data;
    console.log('QR data: ' + token);

    // Check if the token is a valid JWT
    let data;
    try {
      data = await JWT.decode(token, secretKey);
    } catch (e) {
      if (e.message === 'Invalid token signature') {
        ToastAndroid.show('Invalid QR', ToastAndroid.SHORT);
        setOverlayColor("red");
        setTimeout(() => setOverlayColor(null), 500);
        return;
      }
    }

    data = data.data; // Handle JWT data
    console.log(data);

    // Update database
    const res = await dbHandler.updateAttendance(data);
    if (!res.success) {
      ToastAndroid.show(res.error, ToastAndroid.SHORT);
      setOverlayColor("red");
      setTimeout(() => setOverlayColor(null), 500);
      return;
    }
    
    setScannedList((list) => [...list, res.data]);
    setOverlayColor("green");
    setTimeout(() => setOverlayColor(null), 500);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  return (
    <AppContext.Provider value={{ isInfoVisible, setInfoVisible, secretKey, setSecretKey }}>
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

function CamPermissionAlert() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission == null) return;
    if (!permission.granted) {
      requestPermission();
    } else {
      console.log("Camera permission granted");
    }
  }, [permission]);
}

function Camera({ handleQRScan }) {
  return (
    <CameraView 
      style={styles.camera}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={handleQRScan}
    >
      <View style={styles.camOverlay} />
    </CameraView>
  );
}

function ScannedList({ scannedList, flatListRef }) {
  return (
    <FlatList
      style={{ flex: 1 }}
      ref={flatListRef}
      data={scannedList}
      renderItem={(data) => <ScannedItem data={data} />}
      keyExtractor={(data, idx) => idx.toString()}
      inverted
    />
  );
}

function InfoModal() {
  const { isInfoVisible, setInfoVisible, secretKey, setSecretKey } = useContext(AppContext);

  return (
    <Modal 
      visible={isInfoVisible}
      onRequestClose={() => setInfoVisible(false)}
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
  );
}

function InfoButton() {
  const { setInfoVisible } = useContext(AppContext);
  return (
    <TouchableOpacity style={styles.infoButton} onPress={() => setInfoVisible(true)}>
      <AntDesign name="infocirlceo" size={24} color="white" />
    </TouchableOpacity>
  );
}

function ShareButton() {
  const fileSharer = async () => {
    const res = await dbHandler.exportCSV();
    await Sharing.shareAsync(res.fileUri);
  };

  return (
    <TouchableOpacity style={styles.shareButton} onPress={fileSharer}>
      <AntDesign name="export" size={24} color="white" />
    </TouchableOpacity>
  );
}
