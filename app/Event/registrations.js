import React from 'react';
import { View } from 'react-native';
import { List, Snackbar, Divider } from 'react-native-paper';
import SQLiteDbHandler from '../../data/SQLiteDbHandler';

const dbHandler = new SQLiteDbHandler();

const Registrations = () => {
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const handleImportCSV = async () => {
    console.log('Import CSV functionality to be implemented');
  };

  const handleViewRegistrations = async () => {
    const registrations = await dbHandler.getAttendees();
    console.log('Registrations:', registrations);
    setSnackbarMessage('View Registrations functionality to be implemented.');
    setSnackbarVisible(true);
  };

  const handleClearRegistrations = async () => {
    const res = await dbHandler.clearRegistrations();
    if (res.success) {
      setSnackbarMessage('Registrations cleared successfully!');
    } else {
      setSnackbarMessage('Failed to clear registrations.');
    }
    setSnackbarVisible(true);
  };

  return (
    <View style={{ paddingHorizontal: 15 }}>
      <List.Section>
        <List.Item
          title="Import CSV"
          onPress={handleImportCSV}
          style={{ paddingVertical: 20, borderRadius: 5 }}
          titleStyle={{ fontWeight: 'bold' }}
          left={() => <List.Icon icon="file-upload" />}
        />
        <Divider />
        <List.Item
          title="View Registrations"
          onPress={handleViewRegistrations}
          style={{ paddingVertical: 20, borderRadius: 5 }}
          titleStyle={{ fontWeight: 'bold' }}
          left={() => <List.Icon icon="eye" />}
        />
        <Divider />
        <List.Item
          title="Clear Registrations"
          onPress={handleClearRegistrations}
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

export default Registrations;
