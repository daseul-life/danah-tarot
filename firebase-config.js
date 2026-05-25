import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyAY5OxPSGbHSqDAwpL6vC5iFA8t8e5iwu0",

  authDomain: "danah-tarot.firebaseapp.com",

  projectId: "danah-tarot",

  storageBucket: "danah-tarot.firebasestorage.app",

  messagingSenderId: "474070774406",

  appId: "1:474070774406:web:32e71f9d617dde0ea55707",

  measurementId: "G-VMNJTFV5YJ"

};

export const firebaseProjectId =
firebaseConfig.projectId;

export const app =
initializeApp(firebaseConfig);

export const auth =
getAuth(app);

await setPersistence(
  auth,
  browserLocalPersistence
);

export const db =
initializeFirestore(
  app,
  {
    localCache:
    persistentLocalCache({
      tabManager:
      persistentMultipleTabManager()
    })
  }
);

export default firebaseConfig;
