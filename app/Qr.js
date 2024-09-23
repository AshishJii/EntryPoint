import React, { useEffect } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import RNFS from 'react-native-fs';
import JSZip from 'jszip';
import { shareAsync } from 'expo-sharing';

export default function Page() {
    const { event } = useLocalSearchParams(); 
    const eventDetails = JSON.parse(event); 
    const secretKey = eventDetails.secretKey;
    const participants = eventDetails.participants;

    const generateZipAndShare = async () => {
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

        // Save the zip file
        const zipFilePath = `${RNFS.DocumentDirectoryPath}/qrcodes.zip`;
        await RNFS.writeFile(zipFilePath, zipFile, 'base64');

        // Share the zip file
        await shareAsync(zipFilePath);
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {participants.map((participant, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                    <QRCode
                        value={`{"name": "${participant.name}", "rollNumber": "${participant.rollNumber}", "secretKey": "${secretKey}"}`}
                        size={200}
                    />
                    <Text style={{ textAlign: 'center', marginTop: 10 }}>
                        {participant.name} - {participant.rollNumber}
                    </Text>
                </View>
            ))}
            <Button title="Download QR Codes as Zip" onPress={generateZipAndShare} />
        </ScrollView>
    );
}
