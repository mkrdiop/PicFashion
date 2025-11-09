// FIX: Switched to Firebase v9 compatibility imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

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


// Initialize Firebase
// FIX: Use compat initialization to avoid errors in environments that don't support tree-shaking well or have module resolution issues.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();
