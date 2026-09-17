// =========================
// FIREBASE CONFIGURATION
// =========================

const firebaseConfig = {
    apiKey: "AIzaSyApUFjtWXH_dhIwfVW26-Cxg9mu5yYZTAQ",
    authDomain: "abit-tech-hub.firebaseapp.com",
    projectId: "abit-tech-hub",
    storageBucket: "abit-tech-hub.firebasestorage.app",
    messagingSenderId: "317814355941",
    appId: "1:317814355941:web:5284d4b00eac630e1da10c",
    measurementId: "G-ZJ98F98T6E"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();