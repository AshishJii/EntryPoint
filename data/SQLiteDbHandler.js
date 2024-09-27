import * as FileSystem from 'expo-file-system';
import * as Papa from 'papaparse';

export const migrateDbIfNeeded = async (db) => {
    const DATABASE_VERSION = 1;
    let result = await db.getFirstAsync('PRAGMA user_version');
    let currentDbVersion = result.user_version;
  
    if (currentDbVersion >= DATABASE_VERSION) {
      return;
    }
  
    if (currentDbVersion === 0) {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS registrations (
              id INTEGER PRIMARY KEY, 
              name VARCHAR(50) NOT NULL,
              email VARCHAR(50) NOT NULL,
              attended INTEGER CHECK (attended IN (0,1)) DEFAULT 0,
              qrGenerated INTEGER CHECK (qrGenerated IN (0,1)) DEFAULT 0,
              emailSent INTEGER CHECK (emailSent IN (0,1)) DEFAULT 0
            );
          `);

      // await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', ['hello', 1]);
      // await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', ['world', 2]);
      currentDbVersion = 1;
    }
  
    // Add future migrations here if needed
    // if (currentDbVersion === 1) {
    //   // Apply migration from version 1 to next version
    // }
  
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
 }

// Save registrations from CSV
export const saveRegistrations = async (db, csv) => {
  const parsedData = Papa.parse(csv, { header: true }).data;
  const insertStatement = await db.prepareAsync(
    'INSERT INTO registrations (id, name, email) VALUES ($id, $name, $email)'
  );

  for (const { Name, Email, Roll } of parsedData) {
    try {
      await insertStatement.executeAsync({ $id: Roll, $name: Name, $email: Email });
      console.log(`${Roll} appended`);
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        console.log('Multiple people with same ID found.\nClear the table.');
      } else {
        console.log('Unexpected error:', err);
      }
    }
  }
};

// Update attendance
export const updateAttendance = async (db, id) => {
  try {
    const st = await db.getFirstAsync('SELECT name, email, attended FROM registrations WHERE id = ?', [id]);
    if (!st) throw new Error('Student not registered');
    if (st.attended === 1) throw new Error('ID already Present');
    
    await db.runAsync('UPDATE registrations SET attended = 1 WHERE id = ?', [id]);
    return { success: true, data: { name: st.name, email: st.email, id } };
  } catch (err) {
    console.log('Error updating attendance:', err);
    return { success: false, error: err.message };
  }
};

// Update QR generated status
export const updateQrGenerated = async (db, id) => {
  try {
    await db.runAsync('UPDATE registrations SET qrGenerated = 1 WHERE id = ?', [id]);
    return { success: true };
  } catch (err) {
    console.log('Error updating QR generated status:', err);
    return { success: false, error: err.message };
  }
};

// Update email sent status
export const updateEmailSent = async (db, id) => {
  try {
    await db.runAsync('UPDATE registrations SET emailSent = 1 WHERE id = ?', [id]);
    return { success: true };
  } catch (err) {
    console.log('Error updating email sent status:', err);
    return { success: false, error: err.message };
  }
};

// does registrations exists
export const hasRegistrations = async (db) => {
  try {
    const result = await db.getAllAsync('SELECT EXISTS (SELECT 1 FROM registrations LIMIT 1)');
    return result;
  } catch (err) {
    console.log('Error checking for registrations:', err);
    return false;
  }
};


// Get all registrations
export const getRegistrations = async (db) => {
  try {
    const results = await db.getAllAsync('SELECT * FROM registrations');
    return results;
  } catch (err) {
    console.log('Error fetching registrations:', err);
    return [];
  }
};

// Get all attendees
export const getAttendees = async (db) => {
  try {
    const results = await db.getAllAsync('SELECT name, id, email FROM registrations WHERE attended = 1');
    return results;
  } catch (err) {
    console.log('Error fetching attendees:', err);
    return [];
  }
};

// Reset the table
export const resetTable = async (db) => {
  try {
    await db.runAsync('DELETE FROM registrations');
    return { success: true };
  } catch (err) {
    console.log('Error resetting table:', err);
    return { success: false, error: err.message };
  }
};

// Export to CSV
export const exportCSV = async (db) => {
  try {
    const attendees = await getAttendees(db);
    const csv = Papa.unparse(attendees);
    const fileUri = FileSystem.documentDirectory + 'attendees.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv);
    return { success: true, fileUri };
  } catch (err) {
    console.log('Error exporting CSV:', err);
    return { success: false, error: err.message };
  }
};
