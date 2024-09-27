import React from 'react';
import { View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { List, Snackbar, Divider } from 'react-native-paper';
import { getCertificates, clearCertificates } from '../../data/SQLiteDbHandler'; // Assuming you have SQLiteDbHandler for managing data

const Certificates = ({ eventId }) => {
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const db = useSQLiteContext();

  const handleGenerateCertificates = async () => {
    console.log('Generate Certificates functionality to be implemented');
    setSnackbarMessage('Certificates generation in progress...');
    setSnackbarVisible(true);
  };

  const handleViewCertificates = async () => {
    const certificates = await getCertificates(db);
    console.log('Certificates:', certificates);
    setSnackbarMessage('View Certificates functionality to be implemented.');
    setSnackbarVisible(true);
  };

  const handleClearCertificates = async () => {
    const res = await clearCertificates(db);
    if (res.success) {
      setSnackbarMessage('Certificates cleared successfully!');
    } else {
      setSnackbarMessage('Failed to clear certificates.');
    }
    setSnackbarVisible(true);
  };

  return (
    <View style={{ paddingHorizontal: 15 }}>
      <List.Section>
        <List.Item
          title="Generate Certificates"
          onPress={handleGenerateCertificates}
          style={{ paddingVertical: 20, borderRadius: 5 }}
          titleStyle={{ fontWeight: 'bold' }}
          left={() => <List.Icon icon="certificate" />}
        />
        <Divider />
        <List.Item
          title="View Certificates"
          onPress={handleViewCertificates}
          style={{ paddingVertical: 20, borderRadius: 5 }}
          titleStyle={{ fontWeight: 'bold' }}
          left={() => <List.Icon icon="eye" />}
        />
        <Divider />
        <List.Item
          title="Clear Certificates"
          onPress={handleClearCertificates}
          style={{ paddingVertical: 20, borderRadius: 5 }}
          titleStyle={{ fontWeight: 'bold' }}
          left={() => <List.Icon icon="delete" />}
        />
      </List.Section>

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

export default Certificates;
