import { StyleSheet } from "react-native";
export default styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    link: {
        height: 50,
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        color: '#FFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'none',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: 100,
        maxHeight: '80%',
        width: '80%',
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
    },
});