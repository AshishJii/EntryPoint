import { FlatList } from 'react-native';
import SQLiteDbHandler from '../data/SQLiteDbHandler';
import MyCard from '../components/myCard';
import events from '../data/Events';

const dbHandler = new SQLiteDbHandler();

export default function Page() {
    return (
        <><FlatList
        data={events}
        keyExtractor={(item, index) => index} 
        renderItem={({ item }) => (
            <MyCard event={item} />
        )}
    />
    </>
    );
}



