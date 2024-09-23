import * as React from "react";
import { Avatar, Button, Card,IconButton, TouchableRipple } from "react-native-paper";
// import styles from '../styles/indexStyles';
import { useRouter } from "expo-router";

const LeftContent = (props) => <Avatar.Icon {...props} icon="folder" />;

const MyCard = ({ event }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/Event/[id]",
      params: { id: event.id, name: event.name }
    });
  };

  return (
    <Card style={{ margin: 5}} rippleColor="#ff000020" onPress={handlePress}>
      <Card.Title title={event.name} subtitle={event.date} left={LeftContent} />
      <Card.Actions>
        <TouchableRipple onPress={handlePress}>
          <IconButton icon="trash-can-outline" />
        </TouchableRipple>
      </Card.Actions>
    </Card>
  );
};

export default MyCard;
