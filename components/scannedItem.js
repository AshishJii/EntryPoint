import { View, Text, StyleSheet } from 'react-native';
import styles from '../styles/scannedItemStyles';

export default function ScannedItem({data}){
    return (
        <View style={styles.listItem}>
            <View style={{flex: 1}}>
                <Text>{data.index+1}.</Text>
            </View>
            <View style={{flex: 3}}>
                <Text>{data.item.name}</Text>
            </View>
            <View style={{flex: 3}}>
                <Text>{data.item.id}</Text>
            </View>
        </View>
    )
}

