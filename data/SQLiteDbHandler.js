import * as SQLite from 'expo-sqlite';
import DbHandler from './DbHandler';
import * as Papa from 'papaparse';

export default class SQLiteDbHandler extends DbHandler {
    constructor(){
        super();
        this.db = SQLite.openDatabaseSync('registrations.db');
        this.createTable();
    }

    createTable(){
        this.db.execSync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY, 
                name VARCHAR(50) NOT NULL,
                email VARCHAR(50) NOT NULL,
                attended INTEGER CHECK (attended IN (0,1)) DEFAULT 0,
                qrGenerated INTEGER CHECK (qrGenerated IN (0,1)) DEFAULT 0,
                emailSent INTEGER CHECK (emailSent IN (0,1)) DEFAULT 0
            );`
        );
    }

    async saveRegistrations(csv){
        const parsedData = Papa.parse(csv, { header: true }).data;
        const insertStatement = await this.db.prepareAsync(
            'INSERT INTO registrations (id, name, email) VALUES ($id, $name, $email)'
        )

        for(const {Name, Email, Roll} of parsedData){
            try{
                const log = await insertStatement.executeAsync({ $id: Roll, $name: Name, $email: Email });
                console.log(Roll+" appended");
            }
            catch(err){
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.error('Multiple people with same ID found.\nClear the table.');                    
                    // break;
                } 
                else {
                    console.error('Unexpected error:', err);
                }
            } 
        }
    }

    async updateQrGenerated(id){
        try {
            await this.db.runAsync('UPDATE registrations SET qrGenerated = 1 WHERE id = ?', [id]);
        } catch (err) {
            console.error('Error updating QR generated status:', err);
        }
    }

    async updateEmailSent(id){
        try {
            await this.db.runAsync('UPDATE registrations SET emailSent = 1 WHERE id = ?', [id]);
        } catch (err) {
            console.error('Error updating email sent status:', err);
        }
    }

    async getRegistrations(){
        try {
            const results = await this.db.getAllAsync('SELECT * FROM registrations');
            return results;
        } catch (err) {
            console.error('Error fetching registrations:', err);
            return [];
        }
    }

    async getAttendees(){
        try {
            const results = await this.db.getAllAsync('SELECT * FROM registrations WHERE attended = 1');
            return results;
        } catch (err) {
            console.error('Error fetching attendees:', err);
            return [];
        }
    }

    async resetTable(){
        try {
            await this.db.runAsync('DELETE FROM registrations;');
            console.log('Table reset successfully.');
        } catch (err) {
            console.error('Error resetting table:', err);
        }
    }
}
