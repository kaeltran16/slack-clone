import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
   apiKey: 'AIzaSyDL0grxMKt2So-tPDbJwiYTa8nSuW84n5I',
   authDomain: 'slack-clone-bf232.firebaseapp.com',
   databaseURL: 'https://slack-clone-bf232.firebaseio.com',
   projectId: 'slack-clone-bf232',
   storageBucket: 'slack-clone-bf232.appspot.com',
   messagingSenderId: '917412857060'
};
firebase.initializeApp(config);

export default firebase;
