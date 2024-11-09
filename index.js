
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  sendEmailVerification, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth"
import { 
  getFirestore,
  collection,
  addDoc
 } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJwrc6CKnA4HqFrWbG5eIf4186JgeMg7w",
  authDomain: "moody-3cb76.firebaseapp.com",
  projectId: "moody-3cb76",
  storageBucket: "moody-3cb76.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
console.log('app: ', app)
const auth = getAuth(app);
console.log('auth: ', auth)
const provider =  new GoogleAuthProvider()
const db = getFirestore(app)
console.log(db)
/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

const userProfilePictureEl = document.getElementById("user-profile-picture")
const userGreetingEl = document.getElementById("user-greeting")

const displayNameInputEl = document.getElementById("display-name-input")
const photoURLInputEl = document.getElementById("photo-url-input")
const updateProfileButtonEl = document.getElementById("update-profile-btn")

const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-button")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

updateProfileButtonEl.addEventListener("click", authUpdateProfile)

postButtonEl.addEventListener("click", postButtonPressed)

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView()
    showProfilePicture(userProfilePictureEl, user)
    showUserGreeting(userGreetingEl, user)
    const uid = user.uid
  } else {
    showLoggedOutView()
  }
})

/* === Functions === */

/* = Functions - Firebase - Authentication = */

async function authSignInWithGoogle() {
  console.log("Sign in with Google")
  try{
    const popUpSignIn = await signInWithPopup(auth, provider)
    console.log('popUpSignIn: ', popUpSignIn)
    const credential = GoogleAuthProvider.credentialFromResult(popUpSignIn)
    console.log('credential: ', credential)
    const token = credential.accessToken
    console.log('token: ', token)
    const user = popUpSignIn.user
    console.log('user: ', user)
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message
    // The email of the user's account used.
    const email = error.customData.email
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error)
    console.error(errorCode, errorMessage)
  }
}

async function authSignInWithEmail() {
  console.log("Sign in with email and password")
  const email = emailInputEl.value
  const password = passwordInputEl.value
  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    if(user) {
      clearAuthFields()
    }
  } catch (error) {
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage)
  }

}

async function authCreateAccountWithEmail() {
  console.log("Sign up with email and password")
  const email = emailInputEl.value
  const password = passwordInputEl.value
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    try {
      const emailSent = await sendEmailVerification(auth.currentUser)
      console.log('emailSent: ')
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage)
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorCode, errorMessage)
  }
}

async function authSignOut() {
      try {
        const signOutVar = await signOut(auth)
        clearAuthFields()
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage)
      }
}

async function authUpdateProfile() {
  const newDisplayName = displayNameInputEl.value
  const newPhotoURL = photoURLInputEl.value
  try {
    await updateProfile(auth.currentUser, {
      displayName: newDisplayName, photoURL: newPhotoURL
    })
    console.log("Profile updated")
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorCode, errorMessage)
  }
}

async function addPostToDB(postBody) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      body: postBody
    })
    console.log('docRef.id: ', docRef.id)
  } catch (error) {
    console.error("Error adding document: ", error)
    
  }
      /*  Challenge:
		Import collection and addDoc from 'firebase/firestore'

    Use the code from the documentaion to make this function work.
        
    The function should add a new document to the "posts" collection in Firestore.
        
        The document should contain a field called 'body' of type "string" with a value of
        postBody (from function parameter)
        
        If the document was written successfully, then console log
        "Document written with ID: {documentID}"
        Where documentID is the actual ID of the newly created document.
        
        If something went wrong, then you should log the error message using console.error
    */
}

/* == Functions - UI Functions == */

function postButtonPressed() {
  const postBody = textareaEl.value
  if(postBody) {
    addPostToDB(postBody)
    clearInputField(textareaEl)
  }
}


function showLoggedOutView() {
  hideView(viewLoggedIn)
  showView(viewLoggedOut)
}

function showLoggedInView() {
  hideView(viewLoggedOut)
  showView(viewLoggedIn)
}

function showView(view) {
  view.style.display = "flex"
}

function hideView(view) {
  view.style.display = "none"
}

function clearInputField(field) {
  field.value = ''
}

function clearAuthFields() {
  clearInputField(emailInputEl)
  clearInputField(passwordInputEl)
}

function showProfilePicture(imgElement, user) {
  if(user) {
    const photoURL = user.photoURL
    if(photoURL) {
      imgElement.src = photoURL
    } else {
      imgElement.src = "assets/images/default-profile-picture.jpeg"
    } 
  } else {
    console.error("No user provided")
  }
}

function showUserGreeting(element, user) {
  let firstName = "friend"
  if(user) {
    const displayName = user.displayName
    if(displayName) {
      const fName = displayName.split(" ")
      firstName = fName[0]
    }
  }
  element.textContent = `Hey ${firstName}, how are you?`
}