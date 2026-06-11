import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAPVJi7Z26rNNHUpmsaPFSw3Il78LRE9s0",
    authDomain: "voluntariado-web.firebaseapp.com",
    projectId: "voluntariado-web",
    storageBucket: "voluntariado-web.firebasestorage.app",
    messagingSenderId: "198751278597",
    appId: "1:198751278597:web:7dfb92dd179d1524882e6c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;