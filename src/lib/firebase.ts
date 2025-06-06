import { initializeApp } from 'firebase/app';
// Importa los servicios de Firebase que vayas a usar (ej: auth, firestore, etc.)
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase (usando variables de entorno de .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // descomentar si usas Realtime Database
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exporta las instancias de los servicios que inicialices (ej: auth, db)
// export const auth = getAuth(app);
// export const db = getFirestore(app);

export default app; 