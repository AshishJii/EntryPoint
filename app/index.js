import { FlatList } from 'react-native';
import MyCard from '../components/myCard';
import events from '../data/Events';
import { useTheme } from 'react-native-paper';

export default function Page() {
    const theme = useTheme();
    return (
        <FlatList
            data={events}
            keyExtractor={(item, index) => index} 
            renderItem={({ item }) => (
                <MyCard event={item} />
            )}
            contentContainerStyle={{backgroundColor: theme.colors.background}} // background is explicitly applied since it hasn't loaded theme on app yet
        />
    );
}



