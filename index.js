
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
  addDoc,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  query,
  where,
  orderBy
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

const allFilterButtonEl = document.getElementById("all-filter-btn")
const filterButtonEls = document.getElementsByClassName("filter-btn")

const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn")

const postsEl = document.getElementById("posts")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

updateProfileButtonEl.addEventListener("click", authUpdateProfile)

postButtonEl.addEventListener("click", postButtonPressed)

for (let moodEmojiEl of moodEmojiEls) {
  moodEmojiEl.addEventListener("click", selectMood)
}

for (let filterButtonEl of filterButtonEls) {
  filterButtonEl.addEventListener("click", selectFilter)
  
}

/* === State === */

let moodState = 0

/* === Global Constants === */

const collectionName = "posts"

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView()
    showProfilePicture(userProfilePictureEl, user)
    showUserGreeting(userGreetingEl, user)
    updateFilterButtonStyle(allFilterButtonEl)
    fetchAllPosts(user)
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

async function addPostToDB(postBody, user) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      body: postBody,
      uid: user.uid,
      createdAt: serverTimestamp(),
      mood: moodState
    })
    console.log('docRef.id: ', docRef.id)
  } catch (error) {
    const errorCode = error.code
    const errorMessage = error.message
    console.error(errorCode, errorMessage)
  }
}

function displayDate(firebaseDate) {
  if(!firebaseDate) {
    return "Date not available"
  }
  const date = firebaseDate.toDate()

  const day = date.getDate()
  const year = date.getFullYear()

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = monthNames[date.getMonth()]

  let hours = date.getHours()
  let minutes = date.getMinutes()
  hours = hours < 10 ? "0" + hours : hours
  minutes = minutes < 10 ? "0" + minutes : minutes
  return `${day} ${month} ${year} - ${hours}:${minutes}`
}

function fetchInRealtimeAndRenderPostsFromDB(query, user) {

  onSnapshot(query, (querySnapshot) => {
    clearAll(postsEl)
    querySnapshot.forEach(post => {
      renderPost(postsEl, post.data())
    });
  })
}

function fetchAllPosts(user) {
  
  const postsRef = collection(db, collectionName)

  const q = query(postsRef,
    where('uid', '==', user.uid),
    orderBy('createdAt', 'desc')
  )
  fetchInRealtimeAndRenderPostsFromDB(q, user)
}


function fetchMonthPosts(user) {
  const startOfMonth = new Date()
  startOfMonth.setHours(0,0,0,0)
  startOfMonth.setDate(1)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const postsRef = collection(db, collectionName)

  const q = query(postsRef,
    where('uid', '==', user.uid),
    where('createdAt', '>=', startOfMonth),
    where('createdAt', '<=', endOfDay),
    orderBy('createdAt', 'desc')
  )
  fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchWeekPosts(user) {
  const startOfWeek = new Date()
  startOfWeek.setHours(0,0,0,0)

  if(startOfWeek.getDay() === 0) {
    startOfWeek.setDate(startOfWeek.getDate() - 6)
  } else {
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1 )
  }
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const postsRef = collection(db, collectionName)

  const q = query(postsRef,
    where('uid', '==', user.uid),
    where('createdAt', '>=', startOfWeek),
    where('createdAt', '<=', endOfDay),
    orderBy('createdAt', 'desc')
  )
  fetchInRealtimeAndRenderPostsFromDB(q, user)
}


function fetchTodayPosts(user) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const postsRef = collection(db, collectionName)
  const q = query(postsRef, 
    where('uid', "==", user.uid),
    where('createdAt', ">=", startOfDay),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt", "desc")
  )
  fetchInRealtimeAndRenderPostsFromDB(q, user)
}

/* == Functions - UI Functions == */

function renderPost(postsEl, postData) {
   const dispDate = displayDate(postData.createdAt)
   const dispMood = postData.mood
   const dispBody = postData.body
    postsEl.innerHTML += `
    <div class="post">
      <div class="header">
        <h3>${dispDate}</h3>
        <img src="assets/emojis/${dispMood}.png">
      </div>
      <p>${replaceNewlinesWithBrTags(dispBody)}</p>
    </div>
    `
}

function replaceNewlinesWithBrTags(inputString) {
  // Challenge: Use the replace method on inputString to replace newlines with break tags and return the result
  
  return inputString.replace(/\n/g, "<br>")
}

function postButtonPressed() {
  const postBody = textareaEl.value
  const user = auth.currentUser
  if(postBody && moodState) {
    addPostToDB(postBody, user)
    clearInputField(textareaEl)
    resetAllMoodElements(moodEmojiEls)
  }
}

function clearAll(element) {
  element.innerHTML = ""
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

/* == Funcitons UI Functions - Mood == */

function selectMood(event) {
  event.preventDefault()
  const selectedMoodEmojiElementId = event.currentTarget.id
  changeMoodStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls)
  const chosenMoodValue = returnMoodValueFromElementId(selectedMoodEmojiElementId)
  moodState = chosenMoodValue
}

function changeMoodStyleAfterSelection(selectedMoodElementId, allMoodElements) {
  for (let moodEmojiEl of allMoodElements) {
    if(selectedMoodElementId === moodEmojiEl.id) {
      moodEmojiEl.classList.remove("unselected-emoji")
      moodEmojiEl.classList.add("selected-emoji")
    } else {
      moodEmojiEl.classList.add("unselected-emoji")
      moodEmojiEl.classList.remove("selected-emoji")
    }
  }
}
function resetAllMoodElements(allMoodElements) {
  for (let moodEmojiEl of allMoodElements) {
      moodEmojiEl.classList.remove("unselected-emoji")
      moodEmojiEl.classList.remove("selected-emoji")
  }
  moodState = 0
}

function returnMoodValueFromElementId(elementId) {
  return Number(elementId.slice(5))
}

/* == Functions - UI Funcitons - Date Filters == */

function resetAllFilterButtons(allFilterButtons) {
  for (let filterButtonEl of allFilterButtons) {
    filterButtonEl.classList.remove("selected-filter")
  }
}

function updateFilterButtonStyle(element) {
  element.classList.add("selected-filter")
}

function fetchPostsFromPeriod(period, user) {
  if (period === 'today') {
    fetchTodayPosts(user)
  } else if (period === "week") {
    fetchWeekPosts(user)
  } else if (period === "month") {
    fetchMonthPosts(user)
  } else {
    fetchAllPosts(user)
  }
}

function selectFilter(event) {
  const user = auth.currentUser
  const selectedFilterElementId = event.target.id
  const selectedFilterPeriod = selectedFilterElementId.split("-")[0]
  const selectedFilterElement = document.getElementById(selectedFilterElementId)

  resetAllFilterButtons(filterButtonEls)
  updateFilterButtonStyle(selectedFilterElement)
  fetchPostsFromPeriod(selectedFilterPeriod, user)
}