import React, { useState } from 'react';
import { View, Text, Button, Modal, ScrollView, ToastAndroid } from 'react-native'; // React Native components
import * as DocumentPicker from 'expo-document-picker'; // For document picking
import * as FileSystem from 'expo-file-system'; // For file system operations
import dbHandler from '../../data/SQLiteDbHandler'; // Assuming your SQLite handler is located here
// import { StyleSheet } from 'react-native'; // For styling


export default function DebugMenu(){
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