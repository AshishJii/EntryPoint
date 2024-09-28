import { useState, useRef, createContext, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Snackbar, FAB, List, Avatar } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Sharing from 'expo-sharing';
import JWT from "expo-jwt";
// import ScannedItem from '../../components/scannedItem';
import styles from '../../styles/scannerStyles';
import { getAttendees, updateAttendance, exportCSV } from '../../data/SQLiteDbHandler';
import { useSQLiteContext } from 'expo-sqlite';

const AppContext = createContext();

export default function Scanner( {eventId} ) {
  const db = useSQLiteContext();
  
  // const { event } = useLocalSearchParams(); // Get the event parameter
  // const eventDetails = JSON.parse(event); // Parse the event details
  const [scannedList, setScannedList] = useState([]);
  const [secretKey, setSecretKey] = useState('TechnicalTeam'); // Set secret key from event details
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [overlayColor, setOverlayColor] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const lastScannedTime = useRef(0);
  const SCAN_DELAY = 1500;
  const flatListRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const attendees = await getAttendees(db);
      console.log(attendees);
      setScannedList(attendees);
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
        setSnackbarMessage('Invalid QR');
        setSnackbarVisible(true);
        setOverlayColor("red");
        setTimeout(() => setOverlayColor(null), 500);
        return;
      }
    }

    data = data.data; // Handle JWT data
    console.log(data);

    // Update database
    const res = await updateAttendance(db, data);
    if (!res.success) {
      setSnackbarMessage(res.error);
      setSnackbarVisible(true);
      setOverlayColor("red");
      setTimeout(() => setOverlayColor(null), 500);
      return;
    }
    
    setScannedList((list) => [...list, res.data]);
    setOverlayColor("green");
    setTimeout(() => setOverlayColor(null), 500);
    setTimeout(() => { // without this delay, list does not scrolls to end, because view is not yet updated. bad practice. FIXME:
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    console.log(scannedList);
  }

  return (
    <AppContext.Provider value={{ isInfoVisible, setInfoVisible, secretKey, setSecretKey }}>
      <View style={styles.container}>
        {overlayColor === "green" && <View style={styles.overlayGreen} />}
        {overlayColor === "red" && <View style={styles.overlayRed} />}
        <CamPermissionAlert />
        <Camera handleQRScan={handleQRScan} />
        <ScannedList scannedList={scannedList} flatListRef={flatListRef} />
        {/* <InfoModal /> */}
        {/* <InfoButton /> */}
        <ShareButton db={db}/>
        <SnackBarComponent 
          snackbarVisible = {snackbarVisible} 
          setSnnackbarVisible={setSnackbarVisible}
          snackbarMessage={snackbarMessage} />
      </View>
    </AppContext.Provider>
  );
}

function SnackBarComponent({snackbarVisible, setSnnackbarVisible, snackbarMessage}) {
   return (
    <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnnackbarVisible(false)}
          duration={3000} >
          {snackbarMessage}
        </Snackbar>
   )
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
      style={{ flex: 1, marginLeft: 10 }}
      ref={flatListRef}
      data={scannedList}
      renderItem={(data) => <ScannedItem data={data} />}
      keyExtractor={(data, idx) => idx.toString()}
      inverted
    />
  );
}

function ScannedItem({data}){
  const {item, index } = data;
  const { name, id, email } = item;

   return (
    <List.Item
      title={name}
      description={`${email}`}
      left={() => (
        <Avatar.Icon 
          size={40} 
          icon="account" 
        />
      )}
      right={() => (
        <Text style={{ width: 60, textAlign: 'left', alignSelf: 'center', fontFamily: 'monospace' }}>
          {id}
        </Text>
      )}
      descriptionNumberOfLines={2}
      style={{
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
      }}
    />
  );
}

function ShareButton({db}) {
  const fileSharer = async () => {
    const res = await exportCSV(db);
    await Sharing.shareAsync(res.fileUri);
  };

  return (
      <FAB
    icon="share-all"
    style={styles.fab}
    onPress={fileSharer}
  />
  );
}
 
/* 
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
*/