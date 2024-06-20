import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
    return (
    <View style={styles.container}>
        <Link href='/qrgen' style={styles.link}>Generate QR</Link>
        <Link href='/scanner' style={styles.link}>Scan Entry</Link>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    link: {
        height: 50,
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        color: '#FFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'none',
    },
});