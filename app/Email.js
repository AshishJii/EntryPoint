import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import SQLiteDbHandler from "../data/SQLiteDbHandler";
import * as MailComposer from "expo-mail-composer";
import styles from "../styles/emailStyles";

export default Email = () => {
  const [status, setStatus] = useState("");
  const [emails, setEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);

  useEffect(() => {
    const fetchAttendees = async () => {
      const dbHandler = new SQLiteDbHandler();
      try {
        const attendees = await dbHandler.getAttendees();
        const emailAddresses = attendees.map((attendee) => attendee.email);
        setEmails(emailAddresses);
      } catch (error) {
        console.error("Error fetching attendees:", error);
        setStatus("An error occurred while fetching attendees");
      }
    };
    fetchAttendees();
  }, []);

  const sendEmails = async () => {
    if (emails.length === 0) {
      setStatus("No attendees found");
      return;
    }
    const options = {
      recipients: emails,
      subject: "Event Update",
      body: "Hello, this is a message for event attendees.",
    };
    try {
      const result = await MailComposer.composeAsync(options);
      if (result.status === MailComposer.MailComposerStatus.SENT) {
        setStatus("Emails sent successfully");
        setSentEmails(emails);
      } else {
        setStatus("Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      setStatus("An error occurred while sending emails");
    }
  };

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
      <Button title="Send Emails" onPress={sendEmails} />
      <FlatList
        data={emails}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
        style={styles.emailList}
      />
      {sentEmails.length > 0 && (
        <View>
          <Text>Sent Emails:</Text>
          <FlatList
            data={sentEmails}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text>{item}</Text>}
          />
        </View>
      )}
    </View>
  );
};
