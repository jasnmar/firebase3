
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  sendEmailVerification, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"

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

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

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

/* == Functions - UI Functions == */

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
  /*  Challenge:
      Use the documentation to make this function work.
      
      This function has two parameters: element and user
      
      We will call this function inside of onAuthStateChanged when the user is logged in.
      
      The function will be called with the following arguments:
      showUserGreeting(userGreetingEl, user)
      
      If the user has a display name, then set the textContent of element to:
      "Hey John, how are you?"
      Where John is replaced with the actual first name of the user
      
      Otherwise, set the textContent of element to:
      "Hey friend, how are you?" 
  */
}