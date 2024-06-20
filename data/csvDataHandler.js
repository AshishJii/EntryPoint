import * as FileSystem from 'expo-file-system';
import DataHandler from "./DataHandler";

export default class CSVDataHandler extends DataHandler {
    constructor(attendeesFileUri){
        super();
        this.attendeesFileUri = attendeesFileUri;
    }
    async load() {
        const fileInfo = await FileSystem.getInfoAsync(this.attendeesFileUri);
        if (!fileInfo.exists) {
            await FileSystem.writeAsStringAsync(this.attendeesFileUri, 'Time,ID');
            console.log('File created: '+this.attendeesFileUri)
        }

        const data = await FileSystem.readAsStringAsync(this.attendeesFileUri);
        return data.split('\n').map(row => row.split(','));
    }

    async save(data) {
        const newRow = data.join(',');
        const fileData = await FileSystem.readAsStringAsync(this.attendeesFileUri, { encoding: FileSystem.EncodingType.UTF8 });
        await FileSystem.writeAsStringAsync(this.attendeesFileUri, `${fileData}\n${newRow}`);
    }
}