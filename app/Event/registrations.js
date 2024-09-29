import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const { id, name, email, attended, qrGenerated, emailSent } = registration;

  // TODO: Test multiple times at different times of day to see which one is faster

  // Method 1: Normal fetch
  // const imageUrl = `http://erp.psit.ac.in/assets/img/Simages/${id}.jpg`;
  // const headers = {};

  // Method 2: Skips DNS resolution, should be faster
  const imageUrl = `http://103.120.30.61/assets/img/Simages/${id}.jpg`;
  const headers = { 'Host': 'erp.psit.ac.in', 'Cookie': '' };

  useEffect(() => {
    const fetchImage = async () => {
      try{
        const fileUri = FileSystem.documentDirectory + `${id}.jpg`;
        const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri, { headers });
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        setImage(`data:image/jpeg;base64,${base64}`);
      } catch (error) {
            console.log('Error fetching image:', error);
            // image of star to indicate problems while fetch
            setImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwBQTFRF7c5J78kt+/Xm78lQ6stH5LI36bQh6rcf7sQp671G89ZZ8c9V8c5U9+u27MhJ/Pjv9txf8uCx57c937Ay5L1n58Nb67si8tVZ5sA68tJX/Pfr7dF58tBG9d5e8+Gc6chN6LM+7spN1pos6rYs6L8+47hE7cNG6bQc9uFj7sMn4rc17cMx3atG8duj+O7B686H7cAl7cEm7sRM26cq/vz5/v767NFY7tJM78Yq8s8y3agt9dte6sVD/vz15bY59Nlb8txY9+y86LpA5LxL67pE7L5H05Ai2Z4m58Vz89RI7dKr+/XY8Ms68dx/6sZE7sRCzIEN0YwZ67wi6rk27L4k9NZB4rAz7L0j5rM66bMb682a5sJG6LEm3asy3q0w3q026sqC8cxJ6bYd685U5a457cIn7MBJ8tZW7c1I7c5K7cQ18Msu/v3678tQ3aMq7tNe6chu6rgg79VN8tNH8c0w57Q83akq7dBb9Nld9d5g6cdC8dyb675F/v327NB6////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/LvB3QAAAMFJREFUeNpiqIcAbz0ogwFKm7GgCjgyZMihCLCkc0nkIAnIMVRw2UhDBGp5fcurGOyLfbhVtJwLdJkY8oscZCsFPBk5spiNaoTC4hnqk801Qi2zLQyD2NlcWWP5GepN5TOtSxg1QwrV01itpECG2kaLy3AYiCWxcRozQWyp9pNMDWePDI4QgVpbx5eo7a+mHFOqAxUQVeRhdrLjdFFQggqo5tqVeSS456UEQgWE4/RBboxyC4AKCEI9Wu9lUl8PEGAAV7NY4hyx8voAAAAASUVORK5CYII=')
      } finally {
        setIsLoading(false); 
      }
    };
    fetchImage();
  },[imageUrl]);

  // console.log(isLoading,imageUrl)

  return (
    <List.Item
      title={name}
      description={`${id}\n${email}\nAttended: ${attended ? 'Yes' : 'No'} | QR Generated: ${qrGenerated ? 'Yes' : 'No'} | Email Sent: ${emailSent ? 'Yes' : 'No'}`}
      left={() => 
        (
        <View>
        {isLoading && (
          <Avatar.Icon 
            size={44} 
            icon="account" 
          />
        )}
        {image && (
          <Image
          source={{ uri: image }} 
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22, 
            display: isLoading ? 'none' : 'flex' // Hide the image until it's loaded
          }} 
          onLoadEnd={() => {console.log(id,"loaded");setIsLoading(false)}} 
        />
        )}
        </View>
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