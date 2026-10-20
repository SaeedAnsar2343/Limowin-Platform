import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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

async function testWrite() {
  try {
    const testDoc = doc(db, 'settings', 'siteConfig');
    await setDoc(testDoc, {
      siteName: "Limowin",
      siteTagline: "World's Premier 3D Gaming & Entertainment Platform",
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const snap = await getDoc(testDoc);
    console.log('SUCCESS! Read back from Firestore:', snap.data());
  } catch (err) {
    console.error('Firestore test error:', err.message);
  }
}

testWrite();
