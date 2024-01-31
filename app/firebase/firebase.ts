import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
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

export const login = async (
  endpoint: string,
  email?: string,
  password?: string
) => {
  initializeApp(firebaseConfig);
  const auth = getAuth();
  auth.useDeviceLanguage();
  try {
    if (endpoint === "facebook") {
      //const provider = new FacebookAuthProvider();
    } else if (endpoint === "google") {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const user = result.user;
        return { name: user.displayName, id: user.uid };
      }
      return null;
    } else if (endpoint === "create") {
      if (email && password) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = credential.user;
        return { name: user.displayName, id: user.uid };
      }
      return null;
    } else {
      if (email && password) {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = credential.user;
        return { name: user.displayName, id: user.uid };
      }
      return null;
    }
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
