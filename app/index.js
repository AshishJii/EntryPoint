import { FlatList } from 'react-native';
import MyCard from '../components/myCard';
import events from '../data/Events';

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



