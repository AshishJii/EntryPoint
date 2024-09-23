import { Text, SafeAreaView, FlatList } from 'react-native';
import SQLiteDbHandler from '../data/SQLiteDbHandler';
import { PaperProvider } from 'react-native-paper';
import MyCard from '../components/myCard';
import events from '../data/Events';

const dbHandler = new SQLiteDbHandler();

export default function Page() {
    return (
        <PaperProvider>
            <SafeAreaView style={styles.margin}>
                <Text style={styles.title}>Events:</Text>

                <FlatList
                    data={events}
                    keyExtractor={(item, index) => index.toString()} 
                    renderItem={({ item }) => (
                        <MyCard event={item} style={styles.margin} />
                    )}
                    contentContainerStyle={{padding:10}}
                />
            </SafeAreaView>
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
