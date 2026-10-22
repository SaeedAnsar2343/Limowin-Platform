import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAEQRDZn6qowaPnOXDcmby-hJQcZPXZLHY",
  authDomain: "pelican-pass.firebaseapp.com",
  projectId: "pelican-pass",
  storageBucket: "pelican-pass.firebasestorage.app",
  messagingSenderId: "414968028726",
  appId: "1:414968028726:web:581253fcd7e4958fd84297",
  measurementId: "G-7JNWT86Q8R"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Export auth helper functions
export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type FirebaseUser
};

// Initialize Analytics conditionally (only in supported browser environments)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    }
  }).catch(() => {});
}

// ----------------------------------------------------
// FIRESTORE SERVICES & SYNCHRONIZATION HELPERS
// ----------------------------------------------------

// 1. Site Settings
export const syncSiteSettingsToFirestore = async (settings: any) => {
  try {
    const ref = doc(db, 'settings', 'siteConfig');
    await setDoc(ref, settings, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore syncSiteSettings fallback:', error);
    return false;
  }
};

export const getSiteSettingsFromFirestore = async () => {
  try {
    const ref = doc(db, 'settings', 'siteConfig');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.warn('Firestore getSiteSettings fallback:', error);
  }
  return null;
};

// 2. Payment Gateways
export const syncPaymentGatewaysToFirestore = async (gateways: any) => {
  try {
    const ref = doc(db, 'settings', 'paymentGateways');
    await setDoc(ref, gateways, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore syncPaymentGateways fallback:', error);
    return false;
  }
};

export const getPaymentGatewaysFromFirestore = async () => {
  try {
    const ref = doc(db, 'settings', 'paymentGateways');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.warn('Firestore getPaymentGateways fallback:', error);
  }
  return null;
};

// 3. User Profiles
export const syncUserToFirestore = async (user: any) => {
  try {
    const ref = doc(db, 'users', user.id);
    await setDoc(ref, user, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore syncUser fallback:', error);
    return false;
  }
};

export const getAllUsersFromFirestore = async () => {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data());
    }
  } catch (error) {
    console.warn('Firestore getAllUsers fallback:', error);
  }
  return null;
};

// 4. Deposits
export const saveDepositToFirestore = async (deposit: any) => {
  try {
    const ref = doc(db, 'deposits', deposit.id);
    await setDoc(ref, deposit, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore saveDeposit fallback:', error);
    return false;
  }
};

export const getAllDepositsFromFirestore = async () => {
  try {
    const colRef = collection(db, 'deposits');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data());
    }
  } catch (error) {
    console.warn('Firestore getAllDeposits fallback:', error);
  }
  return null;
};

export const updateDepositStatusInFirestore = async (depositId: string, status: 'approved' | 'rejected', reason?: string) => {
  try {
    const ref = doc(db, 'deposits', depositId);
    await updateDoc(ref, {
      status,
      rejectReason: reason || null,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.warn('Firestore updateDepositStatus fallback:', error);
    return false;
  }
};

// 5. Withdrawals
export const saveWithdrawalToFirestore = async (withdrawal: any) => {
  try {
    const ref = doc(db, 'withdrawals', withdrawal.id);
    await setDoc(ref, withdrawal, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore saveWithdrawal fallback:', error);
    return false;
  }
};

export const getAllWithdrawalsFromFirestore = async () => {
  try {
    const colRef = collection(db, 'withdrawals');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data());
    }
  } catch (error) {
    console.warn('Firestore getAllWithdrawals fallback:', error);
  }
  return null;
};

export const updateWithdrawalStatusInFirestore = async (withdrawalId: string, status: 'approved' | 'rejected', txRef?: string, reason?: string) => {
  try {
    const ref = doc(db, 'withdrawals', withdrawalId);
    await updateDoc(ref, {
      status,
      txRef: txRef || null,
      rejectReason: reason || null,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.warn('Firestore updateWithdrawalStatus fallback:', error);
    return false;
  }
};

// 6. Promotions
export const savePromotionToFirestore = async (promotion: any) => {
  try {
    const ref = doc(db, 'promotions', promotion.id);
    await setDoc(ref, promotion, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore savePromotion fallback:', error);
    return false;
  }
};

export const deletePromotionFromFirestore = async (promoId: string) => {
  try {
    const ref = doc(db, 'promotions', promoId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.warn('Firestore deletePromotion fallback:', error);
    return false;
  }
};

export const getAllPromotionsFromFirestore = async () => {
  try {
    const colRef = collection(db, 'promotions');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.warn('Firestore getAllPromotions fallback:', error);
  }
  return null;
};

// 7. Deposit Bonus Configuration (Dual Currency Engine: Percent / Fixed)
export const syncDepositBonusConfigToFirestore = async (config: any) => {
  try {
    const ref = doc(db, 'settings', 'depositBonus');
    await setDoc(ref, config, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore syncDepositBonusConfig fallback:', error);
    return false;
  }
};

export const getDepositBonusConfigFromFirestore = async () => {
  try {
    const ref = doc(db, 'settings', 'depositBonus');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.warn('Firestore getDepositBonusConfig fallback:', error);
  }
  return null;
};

// 8. Game Overrides & RTP
export const syncGameOverridesToFirestore = async (overrides: any) => {
  try {
    const ref = doc(db, 'settings', 'gameOverrides');
    await setDoc(ref, overrides, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore syncGameOverrides fallback:', error);
    return false;
  }
};

export const getGameOverridesFromFirestore = async () => {
  try {
    const ref = doc(db, 'settings', 'gameOverrides');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.warn('Firestore getGameOverrides fallback:', error);
  }
  return null;
};

// 9. Game Rounds History
export const saveGameRoundToFirestore = async (userId: string, round: any) => {
  try {
    const ref = doc(db, 'gameHistory', round.id);
    await setDoc(ref, { ...round, userId }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore saveGameRound fallback:', error);
    return false;
  }
};

// 10. Live VIP Support Chat
export const saveChatMessageToFirestore = async (msg: any) => {
  try {
    const ref = doc(db, 'supportMessages', msg.id);
    await setDoc(ref, msg, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore saveChatMessage fallback:', error);
    return false;
  }
};

export const getAllChatMessagesFromFirestore = async () => {
  try {
    const colRef = collection(db, 'supportMessages');
    const q = query(colRef, orderBy('createdAt', 'asc'), limit(200));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data());
    }
  } catch (error) {
    console.warn('Firestore getAllChatMessages fallback:', error);
  }
  return null;
};

export const subscribeToChatMessages = (callback: (messages: any[]) => void) => {
  try {
    const colRef = collection(db, 'supportMessages');
    const q = query(colRef, orderBy('createdAt', 'asc'), limit(200));
    return onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => d.data());
      callback(msgs);
    }, err => {
      console.warn('Firestore chat snapshot error:', err);
    });
  } catch (error) {
    console.warn('Firestore subscribeToChatMessages fallback:', error);
    return () => {};
  }
};

// 11. Top Banner Slides
export const syncBannersToFirestore = async (banners: any[]) => {
  try {
    const ref = doc(db, 'settings', 'heroBanners');
    await setDoc(ref, { slides: banners, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore syncBanners fallback:', error);
    return false;
  }
};

export const getBannersFromFirestore = async () => {
  try {
    const ref = doc(db, 'settings', 'heroBanners');
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.slides) {
      return snap.data().slides;
    }
  } catch (error) {
    console.warn('Firestore getBanners fallback:', error);
  }
  return null;
};
