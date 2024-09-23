import * as React from 'react';
import { Avatar, Button, Card, TouchableRipple } from 'react-native-paper';
import styles from '../styles/indexStyles';
import { useRouter } from 'expo-router';

const LeftContent = props => <Avatar.Icon {...props} icon="folder" />;

const MyCard = ({ event }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/Event',
      params: { event: JSON.stringify(event) }, // Pass the event details as a parameter
    });
  }

  return (
    <TouchableRipple onPress={handlePress} rippleColor="rgba(0,0,0,0.32)">
      <Card style={styles.margin}>
        <Card.Title title={event.name} subtitle={event.date} left={LeftContent} />
        <Card.Actions>
          <Button>Remove</Button>
        </Card.Actions>
      </Card>
    </TouchableRipple>
  );
};

export default MyCard;
