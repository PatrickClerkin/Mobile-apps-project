// src/app/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { environment } from '../environments/environment';

// Initialize Firebase
const app = initializeApp(environment.firebase);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in production)
export const analytics = environment.production ? getAnalytics(app) : null;

export default app;