import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { MD3LightTheme as DefaultTheme, Appbar, PaperProvider, Modal, Portal, Text, Button } from 'react-native-paper';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import * as sqliteDb from './../data/SQLiteDbHandler';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'purple',
    secondary: 'blue',
  },
};

export default function Layout() {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="events.db" onInit={sqliteDb.migrateDbIfNeeded}>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              header: () => <CustomHeader title="Events" onInfo={showModal} />,
            }}
          />
          <Stack.Screen
            name="Event/[id]"
            options={({ route, navigation }) => ({
              header: () => <CustomHeader title={route.params.name} onBack={navigation.goBack} />,
            })}
          />
        </Stack>

        {/* Info Modal */}
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>About this App</Text>
            <View style={styles.contentContainer}>
              <Text>This app is designed for managing events effectively.</Text>
              <Text>Features include:</Text>
              <Text>- Registration management</Text>
              <Text>- Ticketing</Text>
              <Text>- Certificate issuance</Text>
              <Text>- Scanning attendee tickets</Text>
            </View>
            <Text style={styles.technicalTeam}>~ Technical Team</Text>
            <View style={{ marginTop: 20 }}>
              <Button mode="contained" onPress={hideModal}>Close</Button>
            </View>
          </Modal>
        </Portal>
      </PaperProvider>
      </SQLiteProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentContainer: {
    marginLeft:20,
    marginBottom: 10,
  },
  technicalTeam: {
    textAlign: 'right', // Align to the right
    marginTop: 10,
  },
});

const CustomHeader = ({ title, onBack, onInfo }) => (
  <Appbar.Header>
    {onBack && <Appbar.BackAction onPress={onBack} />}
    <Appbar.Content title={title} />
    {onInfo && <Appbar.Action icon="information" onPress={onInfo} />}
  </Appbar.Header>
);
