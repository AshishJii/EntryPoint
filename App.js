
import { StatusBar } from 'expo-status-bar';
import { Button, TextInput, TouchableOpacity, Text, View, ToastAndroid, Linking, Modal, FlatList} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useState, useRef, createContext, useContext, useEffect } from 'react';
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
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayColor, setOverlayColor] = useState(null);

  const lastScannedTime = useRef(0);
  const SCAN_DELAY = 1500;
  const attendeesFileUri = FileSystem.documentDirectory + 'Attendence.csv';
  const flatListRef = useRef(null);

  useEffect(() => {
    loadCSV();
  },[])

  // loads the initial csv file
  const loadCSV = async () => {
    // Check for file presence
    const fileInfo = await FileSystem.getInfoAsync(attendeesFileUri);
    console.log('File Exists? '+fileInfo.exists);
    if(!fileInfo.exists){
      await FileSystem.writeAsStringAsync(attendeesFileUri, '');
      console.log('File created: '+attendeesFileUri)
      const header = 'Time,ID'; // CSV header
      await FileSystem.writeAsStringAsync(attendeesFileUri, header);
      console.log('Attendees file created');
    }
    
    // load data to array
    const data = await FileSystem.readAsStringAsync(attendeesFileUri);
    const rows = data.split('\n');
    const parsedData = rows.map(row => {
      const values = row.split(',');
      return values;
    });
    console.log(JSON.stringify(parsedData));
    setScannedList(parsedData);
  }

  const updateCSV = async (newData) => {
    let newRow = newData.join(',');
    let fileData = await FileSystem.readAsStringAsync(attendeesFileUri, {encoding: FileSystem.EncodingType.UTF8});
    const newFileData = fileData + '\n' + newRow;
    await FileSystem.writeAsStringAsync(attendeesFileUri, newFileData);
  }

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
        setOverlayColor("red")
        setTimeout(() => setOverlayColor(null), 500);
        return;
      }
    }

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

    //create new row
    console.log(lastScannedTime.current);
    const dt = new Date(lastScannedTime.current).toLocaleString().replace(', ',' ');
    console.log(dt);
    const newRow = [dt, JSON.stringify(data)];

    //Update csvfile and list array 
    updateCSV(newRow);
    setScannedList((list) => {
      return [...list, newRow];
    });
    setTimeout(()=>{  // this feels wrong, but is important to make sure re-render happens before scroll
      flatListRef.current?.scrollToEnd({ animated: true });
    },100);

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

        {overlayColor === "green" && <View style={styles.overlayGreen} />}
        {overlayColor === "red" && <View style={styles.overlayRed} />}

        {/* List view */}

        <FlatList style={{flex: 1}}
        ref={flatListRef}
          data={scannedList}
          renderItem={(data) => <ScannedItem data={data}/>}
          keyExtractor={(data,idx) => idx}
          inverted
        />
  
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