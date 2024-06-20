import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
    return (
    <View>
        <Link href='/qrgen' style={{height: 30}}>Generate QR</Link>
        <Link href='/scanner' style={{height: 30}}>Scan Entry</Link>
    </View>
    )
}