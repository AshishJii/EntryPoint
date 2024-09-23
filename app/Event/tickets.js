import React from 'react';
import { View } from 'react-native';
import { List, Snackbar, Divider } from 'react-native-paper';
import SQLiteDbHandler from '../../data/SQLiteDbHandler';

const dbHandler = new SQLiteDbHandler();

const Tickets = () => {
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const handleCreateTickets = async () => {
    console.log('Create Tickets functionality to be implemented');
    setSnackbarMessage('Create Tickets functionality to be implemented.');
    setSnackbarVisible(true);
  };

  const handleViewTickets = async () => {
    const tickets = await dbHandler.getTickets(); // Assuming you have a method to get tickets
    console.log('Tickets:', tickets);
    setSnackbarMessage('View Tickets functionality to be implemented.');
    setSnackbarVisible(true);
  };

  const handleSendTickets = async () => {
    console.log('Send Tickets functionality to be implemented');
    setSnackbarMessage('Send Tickets functionality to be implemented.');
    setSnackbarVisible(true);
  };

  return (
    <View style={{ padding: 10 }}>
      <List.Item
        title="Create Tickets"
        onPress={handleCreateTickets}
        style={{ paddingVertical: 20, borderRadius: 5 }}
        titleStyle={{ fontWeight: 'bold' }}
        left={() => <List.Icon icon="plus" />}
      />
      <Divider />
      <List.Item
        title="View Tickets"
        onPress={handleViewTickets}
        style={{ paddingVertical: 20, borderRadius: 5 }}
        titleStyle={{ fontWeight: 'bold' }}
        left={() => <List.Icon icon="ticket" />}
      />
      <Divider />
      <List.Item
        title="Send Tickets"
        onPress={handleSendTickets}
        style={{ paddingVertical: 20, borderRadius: 5 }}
        titleStyle={{ fontWeight: 'bold' }}
        left={() => <List.Icon icon="send" />}
      />

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

export default Tickets;
