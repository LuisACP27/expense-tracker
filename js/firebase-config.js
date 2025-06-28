// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEmms2X03v-YrksUmHhBUXjnqsQF0CMq4",
    authDomain: "expense-tracker-35067.firebaseapp.com",
    projectId: "expense-tracker-35067",
    storageBucket: "expense-tracker-35067.firebasestorage.app",
    messagingSenderId: "602262833042",
    appId: "1:602262833042:web:5dc9c59701c7c5f7ece34b",
    measurementId: "G-MG4HV9XS8Q"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export the config for modules that need it
if (typeof module !== 'undefined') {
    module.exports = { firebaseConfig };
} 