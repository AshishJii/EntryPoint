import { View, Text, StyleSheet } from 'react-native';

export default function ScannedItem({data}){
    return (
        <View style={styles.listItem}>
            <View style={{flex: 1}}>
                <Text>{data.index+1}.</Text>
            </View>
            <View style={{flex: 3}}>
                <Text>{data.item[0]}</Text>
            </View>
            <View style={{flex: 3}}>
                <Text>{data.item[1]}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        backgroundColor: '#e3e3e3',
        margin: 3,
        padding: 7,
        borderColor: '#c3c3c3',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderRightWidth: 3
    }
});