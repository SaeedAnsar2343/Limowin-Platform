import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAEQRDZn6qowaPnOXDcmby-hJQcZPXZLHY",
  authDomain: "pelican-pass.firebaseapp.com",
  projectId: "pelican-pass",
  storageBucket: "pelican-pass.firebasestorage.app",
  messagingSenderId: "414968028726",
  appId: "1:414968028726:web:581253fcd7e4958fd84297",
  measurementId: "G-7JNWT86Q8R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized successfully for project:', firebaseConfig.projectId);
