import firebase from 'firebase/app';
import '@firebase/firestore'

const config = {
    apiKey: "AIzaSyBmj3aW-4U8Xfv9g0KE5YVlWmn2aPr_s_g",
    authDomain: "boke-history.firebaseapp.com",
    databaseURL: "https://boke-history.firebaseio.com",
    projectId: "boke-history",
    storageBucket: "boke-history.appspot.com",
    messagingSenderId: "1043933582113"
};

firebase.initializeApp(config);
const settings = {timestampsInSnapshots: true};
const firestore = firebase.firestore();
firestore.settings(settings);
export default firestore;

