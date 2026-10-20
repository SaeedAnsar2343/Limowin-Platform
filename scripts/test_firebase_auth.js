import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function testAuthAndStore() {
  const testEmail = 'player.limo.test@gmail.com';
  const testPass = 'Password123!';

  let userCred;
  try {
    userCred = await signInWithEmailAndPassword(auth, testEmail, testPass);
    console.log('Firebase user logged in:', userCred.user.uid);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        userCred = await createUserWithEmailAndPassword(auth, testEmail, testPass);
        console.log('Firebase user created:', userCred.user.uid);
      } catch (cErr) {
        console.log('Create error:', cErr.message);
        return;
      }
    } else {
      console.log('Login error:', err.message);
      return;
    }
  }

  if (userCred) {
    try {
      const userDoc = doc(db, 'users', userCred.user.uid);
      await setDoc(userDoc, {
        email: testEmail,
        balance: 18450.00,
        bonusBalance: 1250.00,
        vipLevel: 'Gold VIP',
        siteName: 'Limowin',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const snap = await getDoc(userDoc);
      console.log('SUCCESSFULLY WRITTEN AND RETRIEVED FROM FIRESTORE UNDER AUTHENTICATED USER!');
      console.log(snap.data());
    } catch (fErr) {
      console.error('Firestore write error:', fErr.message);
    }
  }
}

testAuthAndStore();
