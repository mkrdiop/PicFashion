import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD88SXud0HPAHC0j-UaSx3iG6IJ-zwMRgA",
  authDomain: "mileshegde.firebaseapp.com",
  databaseURL: "https://mileshegde.firebaseio.com",
  projectId: "mileshegde",
  storageBucket: "mileshegde.firebasestorage.app",
  messagingSenderId: "32473636519",
  appId: "1:32473636519:web:42d35de3596178ec8c4582"
};

// !!! AVERTISSEMENT DE SÉCURITÉ !!!
// La clé API ci-dessous sera exposée publiquement dans le navigateur de l'utilisateur.
// N'utilisez cette méthode que pour des tests. Pour la production, utilisez une fonction backend (Cloud Function)
// pour protéger votre clé API contre le vol et l'utilisation abusive.
export const geminiApiKey = "AIzaSyBx1uH85tWOF4QmTCWns6_kdOP23t9Bpx0";


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);