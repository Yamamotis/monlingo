import { initializeApp } from 'firebase/app'
import { getAuth }       from 'firebase/auth'
import { getFirestore }  from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyBKY69-dhUx_qS7hkkC9KBGYsVO-yKzNcs",
  authDomain:        "monlingo.firebaseapp.com",
  projectId:         "monlingo",
  storageBucket:     "monlingo.firebasestorage.app",
  messagingSenderId: "307987202304",
  appId:             "1:307987202304:web:5aadf5c02ebf7c3d2bb3e5",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
