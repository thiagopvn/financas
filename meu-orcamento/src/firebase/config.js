// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQsOcRpmJS0wan86S3oO5q36hvZKys3M0",
  authDomain: "financas-63b88.firebaseapp.com",
  databaseURL: "https://financas-63b88-default-rtdb.firebaseio.com",
  projectId: "financas-63b88",
  storageBucket: "financas-63b88.firebasestorage.app",
  messagingSenderId: "60593782138",
  appId: "1:60593782138:web:66fe9ae8c4bc2652b2eac3",
  measurementId: "G-FHQEBJ4CND"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Analytics apenas no navegador
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Inicializar serviços do Firebase
export const auth = getAuth(app);

// Configurar Firestore com settings otimizados
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Força uso de long polling
  });
} catch (error) {
  // Se já foi inicializado, usar getFirestore
  db = getFirestore(app);
}

export { db };
export const storage = getStorage(app);

// Configurar Firestore para usar long polling em caso de problemas de conectividade
if (typeof window !== 'undefined') {
  // Suprimir warnings do Firebase relacionados a QUIC e conectividade
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = args.join(' ');
    // Suprimir warnings específicos do Firebase/Firestore
    if (message.includes('QUIC_PROTOCOL_ERROR') || 
        message.includes('FirebaseError') ||
        message.includes('firebase-U5Mo5Kzc.js') ||
        message.includes('Connection failed') ||
        message.includes('RPC failed')) {
      return; // Não mostrar estes warnings
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args.join(' ');
    // Suprimir erros específicos do Firebase/Firestore que são temporários
    if (message.includes('QUIC_PROTOCOL_ERROR') || 
        message.includes('ERR_QUIC_PROTOCOL_ERROR') ||
        message.includes('firebase-U5Mo5Kzc.js')) {
      console.info('Firebase: Erro de conectividade temporário (normal)');
      return;
    }
    originalError.apply(console, args);
  };
  
  // Handler para rejections não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('QUIC_PROTOCOL_ERROR') ||
        event.reason?.code === 'unavailable') {
      event.preventDefault();
      console.info('Firebase: Reconectando automaticamente...');
    }
  });

  // Handler para erros não tratados
  window.addEventListener('error', (event) => {
    if (event.message?.includes('firebase-U5Mo5Kzc.js') ||
        event.message?.includes('QUIC_PROTOCOL_ERROR')) {
      event.preventDefault();
    }
  });
}

export { analytics };
export default app;