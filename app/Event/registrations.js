import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Snackbar, IconButton, Button, DataTable, List, Avatar, Text, ActivityIndicator } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { saveRegistrations, hasRegistrations, getRegistrations, resetTable } from './../../data/SQLiteDbHandler';
import { useRegistrationContext } from "../../contexts/RegistrationContext";

const Registrations = ({ eventId }) => {
  const { registrations, setRegistrations } = useRegistrationContext();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const db = useSQLiteContext();

  useEffect(() => {
    const checkRegistrations = async () => {
      const hasReg = await hasRegistrations(db);
      if (hasReg) {

        fetchRegistrations();
      }
    };
    if (registrations.length === 0) {
      checkRegistrations();
    }
  }, []);
  

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const registrationList = await getRegistrations(db);
      if (registrationList.length > 0) {
        setRegistrations(registrationList);
      }
    } catch (err) {
      setSnackbarMessage('Failed to load registrations.');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSV = async () => {
    const doc = await DocumentPicker.getDocumentAsync();
    if (!doc.canceled) {
      let data = await FileSystem.readAsStringAsync(doc.assets[0].uri);
      await saveRegistrations(db, data);
      setSnackbarMessage('CSV Imported successfully');
      setSnackbarVisible(true);
      fetchRegistrations(); // Refresh the list after import
    }
  };

  const handleClearRegistrations = async () => {
    try {
      setIsClearing(true);
      const res = await resetTable(db);
      if (res.success) {
        setSnackbarMessage('Registrations cleared successfully!');
        setRegistrations([]); // Reset registrations
      } else {
        setSnackbarMessage('Failed to clear registrations.');
      }
    } catch (err) {
      setSnackbarMessage('Error clearing registrations.');
    } finally {
      setSnackbarVisible(true);
      setIsClearing(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading || isClearing ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : registrations.length === 0 ? (
        <View style={styles.centeredContainer}>
        <Button mode="contained" onPress={handleImportCSV}>
          Import CSV
        </Button>
        <Text>No Registrations. Import CSV to proceed.</Text>
      </View>
      ) : (
        <View>
          <View style={styles.headerContainer}>
            <Text style={styles.totalText}>Total Registrations: {registrations.length}</Text>
            <IconButton
              icon="delete"
              size={24}
              color="red"
              onPress={handleClearRegistrations}
              style={styles.clearIcon}
            />
          </View>

          <FlatList
            data={registrations}
            renderItem={({ item }) => <RegistrationItem registration={item} />}
            keyExtractor={(item) => item.id}
            initialNumToRender={1}
            onEndReachedThreshold={0.1}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const RegistrationItem = ({ registration }) => {
  const { id, name, email, attended, qrGenerated, emailSent } = registration;

  const imageUrl = `https://erp.psit.ac.in/assets/img/Simages/${id}.jpg`;

  // console.log(imageUrl)
  return (
    <List.Item
      title={name}
      description={`${id}\n${email}\nAttended: ${attended ? 'Yes' : 'No'} | QR Generated: ${qrGenerated ? 'Yes' : 'No'} | Email Sent: ${emailSent ? 'Yes' : 'No'}`}
      left={() => 
        (
          <Avatar.Icon 
            size={40} 
            icon="account" 
          />
      )}
      right={() => <DataTable.Cell>{id}</DataTable.Cell>}
      descriptionNumberOfLines={3}
      style={{ paddingVertical: 10 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearIcon: {
    backgroundColor: 'transparent',
  },
  flatListContent: {
    paddingBottom: 70,
  },
});

export default Registrations;