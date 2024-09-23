import { Button, Text, View, ScrollView } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router'; // Import useRouter for navigation
import SQLiteDbHandler from '../data/SQLiteDbHandler';
import styles from '../styles/indexStyles';
import { PaperProvider } from 'react-native-paper';

const dbHandler = new SQLiteDbHandler();


export default function Event() {
    const { event } = useLocalSearchParams(); // Get the event parameter
    const eventDetails = JSON.parse(event); // Parse the event details
    const router = useRouter(); // Initialize the router
  
    return (
      <PaperProvider>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{eventDetails.name}</Text>
          <Text>{eventDetails.date}</Text>
  
          <View style={styles.linkContainer}>
            <Link href='/Qr' style={styles.link}>Generate QR 📄</Link>
            <Link href='/Email' style={styles.link}>Send Mail 📨</Link>
            <Link 
              href={{
                pathname: '/Scanner',
                params: { event: JSON.stringify(eventDetails) } // Pass the event details
              }} 
              style={styles.link}
            >
              Scan Entry 📷
            </Link>
          </View>
  
          {/* Go Back Button */}
          <Button title="Go Back" onPress={() => router.back()} />
        </ScrollView>
      </PaperProvider>
    );
  }



// function DebugMenu(){
//     const [modalVisible, setModalVisible] = useState(false);
//     const [modalData, setModalData] = useState([]);
//     const [modalTitle, setModalTitle] = useState("");
//     const showDataInModal = (title, data) => {
//         setModalTitle(title);
//         setModalData(data);
//         setModalVisible(true);
//     };

//     async function pickCSV(){
//         console.log('Importing csv');
//         const doc = await DocumentPicker.getDocumentAsync();
//         if(doc.canceled == false){
//             console.log(doc.assets);
//             let data = await FileSystem.readAsStringAsync(doc.assets[0].uri);
//             dbHandler.saveRegistrations(data).then(() => ToastAndroid.show('CSV Imported', ToastAndroid.SHORT));
//         }
//     }

//     return (
//         <View style={{position: 'absolute', bottom: 0, padding: 20, margin: 40, backgroundColor: "#ddd"}}>
//             <Text>Debugging options:</Text>
//             <Button 
//             title='Import CSV' 
//             onPress={pickCSV} 
//             />
//             <Button 
//             title='Get registrations' 
//             onPress={async () => {const data = await dbHandler.getRegistrations(); showDataInModal("Registrations: "+data.length, data);}}
//             style={styles.link}
//             />
//             <Button 
//             title='Get attendees' 
//             onPress={async () => {const data = await dbHandler.getAttendees(); showDataInModal("Attendees: "+data.length, data);}}
//             />
//             <Button 
//             title='Clear Table⚠️' 
//             onPress={async () => {const res = await dbHandler.resetTable(); if(res.success) ToastAndroid.show('Database cleared', ToastAndroid.SHORT);}}
//             />

//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={modalVisible}
//                 onRequestClose={() => setModalVisible(false)}
//             >
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalView}>
//                         <Text style={styles.modalTitle}>{modalTitle}</Text>
//                         <ScrollView>
//                             {modalData.map((row, index) => (
//                                 <Text key={index} style={styles.modalText}>{JSON.stringify(row)}</Text>
//                             ))}
//                         </ScrollView>
//                         <Button title="Close" onPress={() => setModalVisible(false)} />
//                     </View>
//                 </View>
//             </Modal>
//             <Text>Imported csv MUST have Name, Roll, Email columns</Text>
//         </View>
//     )
// }
