import React from 'react';
import { View, Text, Button, ScrollView, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import RNFS from 'react-native-fs';
import JSZip from 'jszip';
import * as MailComposer from 'expo-mail-composer';
// import styles from '../styles/indexStyles'

export default function Email() {
    const { event } = useLocalSearchParams();
    const eventDetails = JSON.parse(event);
    const secretKey = eventDetails.secretKey;
    const participants = eventDetails.participants;

    const generateZipAndEmail = async () => {
        const zip = new JSZip();
        const folder = zip.folder("qrcodes");

        await Promise.all(participants.map(async (participant) => {
            const svgData = `{"name": "${participant.name}", "rollNumber": "${participant.rollNumber}", "secretKey": "${secretKey}"}`;
            const uri = `${RNFS.DocumentDirectoryPath}/${participant.name}.svg`;

            // Generate QR code and save as SVG
            await new Promise((resolve) => {
                QRCode.toFile(uri, svgData, { type: 'svg' }, (err) => {
                    if (err) console.error(err);
                    resolve();
                });
            });

            // Read the file and add to zip
            const content = await RNFS.readFile(uri, 'base64');
            folder.file(`${participant.name}.svg`, content, { base64: true });
        }));

        const zipFile = await zip.generateAsync({ type: 'base64' });
        const zipFilePath = `${RNFS.DocumentDirectoryPath}/qrcodes.zip`;
        await RNFS.writeFile(zipFilePath, zipFile, 'base64');

        // Email the zip file to each participant
        await Promise.all(participants.map(async (participant) => {
            await MailComposer.composeAsync({
                recipients: [participant.email],
                subject: 'Your QR Code',
                body: `Here is your QR code, ${participant.name}.`,
                attachments: [zipFilePath],
            });
        }));

        Alert.alert('Success', 'Emails sent successfully!');
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Send QR Codes to Participants</Text>
            <FlatList
                data={participants}
                keyExtractor={(item) => item.rollNumber}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 20 }}>
                        <Text>{item.name} - {item.rollNumber}</Text>
                    </View>
                )}
            />
            <Button title="Send QR Codes via Email" onPress={generateZipAndEmail} />
            <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.backButton}
            rippleColor="#ff000020"
          >
            Go Back
          </Button>
        </ScrollView>
    );
}
