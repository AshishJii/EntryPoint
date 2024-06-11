import { View, Text, StyleSheet } from 'react-native';

export default function ScannedItem({data}){
    return (
        <View style={styles.listItem}>
            <Text>{data}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    listItem: {
        backgroundColor: '#e3e3e3',
        margin: 3,
        padding: 7,
        borderColor: '#c3c3c3',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 4
    },
});