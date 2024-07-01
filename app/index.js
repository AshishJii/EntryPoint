import { Button, StyleSheet, Text, View, Modal, ScrollView, ToastAndroid } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import SQLiteDbHandler from '../data/SQLiteDbHandler';

const dbHandler = new SQLiteDbHandler();

export default function Page() {
    return (
    <View style={styles.container}>
        <Link href='/Qr' style={styles.link}>Generate QR 📄</Link>
        <Link href='/Email' style={styles.link}>Send Mail 📨</Link>
        <Link href='/Scanner' style={styles.link}>Scan Entry 📷</Link>
        {/* Only for Debugging purposes. Remove afterwards */}
        <DebugMenu />
    </View>
    )
}

function DebugMenu(){
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState("");
    const showDataInModal = (title, data) => {
        setModalTitle(title);
        setModalData(data);
        setModalVisible(true);
    };

    async function pickCSV(){
        console.log('Importing csv');
        const doc = await DocumentPicker.getDocumentAsync();
        if(doc.canceled == false){
            console.log(doc.assets);
            let data = await FileSystem.readAsStringAsync(doc.assets[0].uri);
            dbHandler.saveRegistrations(data).then(() => ToastAndroid.show('CSV Imported', ToastAndroid.SHORT));
        }
    }

    return (
        <View style={{position: 'absolute', bottom: 0, padding: 20, margin: 40, backgroundColor: "#ddd"}}>
            <Text>Debugging options:</Text>
            <Button 
            title='Import CSV' 
            onPress={pickCSV} 
            />
            <Button 
            title='Get registrations' 
            onPress={async () => {const data = await dbHandler.getRegistrations(); showDataInModal("Registrations: "+data.length, data);}}
            style={styles.link}
            />
            <Button 
            title='Get attendees' 
            onPress={async () => {const data = await dbHandler.getAttendees(); showDataInModal("Attendees: "+data.length, data);}}
            />
            <Button 
            title='Clear Table⚠️' 
            onPress={async () => {const res = await dbHandler.resetTable(); if(res.success) ToastAndroid.show('Database cleared', ToastAndroid.SHORT);}}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <ScrollView>
                            {modalData.map((row, index) => (
                                <Text key={index} style={styles.modalText}>{JSON.stringify(row)}</Text>
                            ))}
                        </ScrollView>
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            <Text>Imported csv MUST have Name, Roll, Email columns</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    link: {
        height: 50,
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        color: '#FFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'none',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: 100,
        maxHeight: '80%',
        width: '80%',
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
    },
});