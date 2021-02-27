import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCoNMKEnzV--RsAAaA8sTvpakJoX-PeSo0",
    authDomain: "wily-app-fe39d.firebaseapp.com",
    projectId: "wily-app-fe39d",
    storageBucket: "wily-app-fe39d.appspot.com",
    messagingSenderId: "907003083788",
    appId: "1:907003083788:web:1fc15f5649d6ad623b0229"
  };
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const db=firebaseApp.firestore();
  export default db;