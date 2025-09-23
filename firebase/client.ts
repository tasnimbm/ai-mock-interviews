// Import the functions you need from the SDKs you need
import { initializeApp,getApps,getApp } from "firebase/app";
import {getAuth}    from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAdJVcKUWieLdmcKbP7Mb_TRiu-qLUQDNY",
    authDomain: "prepwise-6deff.firebaseapp.com",
    projectId: "prepwise-6deff",
    storageBucket: "prepwise-6deff.firebasestorage.app",
    messagingSenderId: "809641053831",
    appId: "1:809641053831:web:352db381f52477d68cf222",
    measurementId: "G-JWC89B1ZM3"
};

// Initialize Firebase
const app =!getApps.length?  initializeApp(firebaseConfig):getApp();
export const    auth=getAuth(app);
export const db= getFirestore(app);