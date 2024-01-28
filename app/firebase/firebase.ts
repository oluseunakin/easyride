/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  FacebookAuthProvider,
  getRedirectResult,
  signInWithPopup,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import type { Media } from "~/types";

const firebaseConfig = {
  apiKey: "AIzaSyAPdjgWVXCNg_SQSun9q8aPpp-Ci2o2jnU",
  authDomain: "providersconnect.firebaseapp.com",
  projectId: "providersconnect",
  storageBucket: "providersconnect.appspot.com",
  messagingSenderId: "497001615476",
  appId: "1:497001615476:web:6da791451368403a230121",
  measurementId: "G-DY1BP4Y6NT",
};

//getAnalytics(app);

export const login = async (endpoint: string) => {
  initializeApp(firebaseConfig);
  const auth = getAuth();
  auth.useDeviceLanguage();
  let provider = new GoogleAuthProvider();
  if (endpoint === "facebook") {
    provider = new FacebookAuthProvider();
  }
  try {
    const result = await signInWithPopup(auth, provider)
    //await signInWithRedirect(auth, provider);
    //const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      return { name: user.displayName, id: user.uid };
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const storeMedia = async (path: string, files: FileList) => {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  let uploadLinks: Array<Media> = [];
  for (const f of files) {
    const storageRef = ref(storage, `${path}/${f.name}`);
    const uploaded = await uploadBytes(storageRef, f);
    const url = await getDownloadURL(uploaded.ref);
    const ct = uploaded.metadata.contentType!;
    uploadLinks.push({ url, ct });
  }
  return uploadLinks;
};
