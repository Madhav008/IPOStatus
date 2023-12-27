// firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBVCM4QrVQDSWqpWORptFVv4yIVai6Kqqw",
    authDomain: "briklin-2e342.firebaseapp.com",
    projectId: "briklin-2e342",
    storageBucket: "briklin-2e342.appspot.com",
    messagingSenderId: "440810007685",
    appId: "1:440810007685:web:04b47a292b0c1a7e790dec",
    measurementId: "G-K6C9C4KYMP"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const logAnalyticsEvent = (eventName: string) => {
    logEvent(analytics, eventName);
};

