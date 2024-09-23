import { Stack } from 'expo-router';
import { MD3LightTheme as DefaultTheme, Appbar, PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native';
const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'purple',
      secondary: 'blue',
    },
  };
  

export default function Layout() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <PaperProvider theme={theme}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                header: () => <CustomHeader title="Events" onInfo={() => { /* Show info modal */ }} />,
              }}
            />
            <Stack.Screen
              name="Event/[id]"
              options={({ route, navigation }) => ({
                header: () => <CustomHeader title={route.params.name} onBack={navigation.goBack} />,
              })}
            />
          </Stack>
        </PaperProvider>
      </SafeAreaView>
    );
}


const CustomHeader = ({ title, onBack, onInfo }) => (
  <Appbar.Header>
    {onBack && <Appbar.BackAction onPress={onBack} />}
    <Appbar.Content title={title} />
    {onInfo && <Appbar.Action icon="information" onPress={onInfo} />}
  </Appbar.Header>
);