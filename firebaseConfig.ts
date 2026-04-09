import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";


const firebaseConfig = {
  apiKey: "AIzaSyCRAdkNuOnbYGTLglxqUTK67rFPHrmFLSg",
  authDomain: "my-opus-c1c1c.firebaseapp.com",
  projectId: "my-opus-c1c1c",
  storageBucket: "my-opus-c1c1c.firebasestorage.app",
  messagingSenderId: "670100224520",
  appId: "1:670100224520:web:9cc535c71996fb14efefbd"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app,
 {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const functions = getFunctions(app);