// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBnbaJKpY3K8H2E3879ht3hdpxGu8ClLH8",
    authDomain: "facade-game.firebaseapp.com",
    projectId: "facade-game",
    storageBucket: "facade-game.firebasestorage.app",
    messagingSenderId: "677958392042",
    appId: "1:677958392042:web:542efdc81dbbff1fa69f93",
    measurementId: "G-6MZE8XY7DB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database as db, auth };