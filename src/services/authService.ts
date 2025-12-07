import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider, isDemoMode } from '../config/firebase';
import { User, SubscriptionTier } from '../types';

// Convert Firebase user to our User type
export const firebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Try to get additional user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data();

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: userData?.username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player',
    subscription: userData?.subscription || 'free',
    createdAt: userData?.createdAt?.toDate() || new Date(),
    stats: userData?.stats || {
      totalPlayTime: 0,
      highestDay: 0,
      achievementsUnlocked: 0,
      totalRevenue: 0
    }
  };
};

// Create user document in Firestore
export const createUserDocument = async (
  userId: string,
  email: string,
  username: string
): Promise<void> => {
  if (isDemoMode()) return;

  await setDoc(doc(db, 'users', userId), {
    email,
    username,
    subscription: 'free' as SubscriptionTier,
    createdAt: serverTimestamp(),
    stats: {
      totalPlayTime: 0,
      highestDay: 0,
      achievementsUnlocked: 0,
      totalRevenue: 0
    }
  });
};

// Update user stats in Firestore
export const updateUserStats = async (
  userId: string,
  stats: Partial<User['stats']>
): Promise<void> => {
  if (isDemoMode()) return;

  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { stats }, { merge: true });
};

// Update subscription in Firestore
export const updateUserSubscription = async (
  userId: string,
  subscription: SubscriptionTier
): Promise<void> => {
  if (isDemoMode()) return;

  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { subscription }, { merge: true });
};

// Auth functions
export const registerWithEmail = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  if (isDemoMode()) {
    // Demo mode - simulate registration
    return {
      id: `demo-${Date.now()}`,
      email,
      username,
      subscription: 'free',
      createdAt: new Date(),
      stats: {
        totalPlayTime: 0,
        highestDay: 0,
        achievementsUnlocked: 0,
        totalRevenue: 0
      }
    };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: username });
  await createUserDocument(userCredential.user.uid, email, username);
  return firebaseUserToUser(userCredential.user);
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  if (isDemoMode()) {
    // Demo mode - simulate login
    return {
      id: `demo-${Date.now()}`,
      email,
      username: email.split('@')[0],
      subscription: 'free',
      createdAt: new Date(),
      stats: {
        totalPlayTime: 0,
        highestDay: 0,
        achievementsUnlocked: 0,
        totalRevenue: 0
      }
    };
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return firebaseUserToUser(userCredential.user);
};

export const loginWithGoogle = async (): Promise<User> => {
  if (isDemoMode()) {
    return {
      id: `demo-google-${Date.now()}`,
      email: 'demo@gmail.com',
      username: 'GoogleUser',
      subscription: 'free',
      createdAt: new Date(),
      stats: {
        totalPlayTime: 0,
        highestDay: 0,
        achievementsUnlocked: 0,
        totalRevenue: 0
      }
    };
  }

  const userCredential = await signInWithPopup(auth, googleProvider);

  // Check if new user
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(
      userCredential.user.uid,
      userCredential.user.email || '',
      userCredential.user.displayName || 'Player'
    );
  }

  return firebaseUserToUser(userCredential.user);
};

export const loginWithGithub = async (): Promise<User> => {
  if (isDemoMode()) {
    return {
      id: `demo-github-${Date.now()}`,
      email: 'demo@github.com',
      username: 'GitHubUser',
      subscription: 'free',
      createdAt: new Date(),
      stats: {
        totalPlayTime: 0,
        highestDay: 0,
        achievementsUnlocked: 0,
        totalRevenue: 0
      }
    };
  }

  const userCredential = await signInWithPopup(auth, githubProvider);

  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(
      userCredential.user.uid,
      userCredential.user.email || '',
      userCredential.user.displayName || 'Player'
    );
  }

  return firebaseUserToUser(userCredential.user);
};

export const logout = async (): Promise<void> => {
  if (!isDemoMode()) {
    await signOut(auth);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isDemoMode()) {
    console.log('Demo mode: Password reset email would be sent to', email);
    return;
  }
  await sendPasswordResetEmail(auth, email);
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (isDemoMode()) {
    // Demo mode - check localStorage for demo user
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      callback(JSON.parse(demoUser));
    }
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await firebaseUserToUser(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};
