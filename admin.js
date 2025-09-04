import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Config ของคุณป๋อง
const firebaseConfig = {
  apiKey: "AIzaSyDaRh7fUTczSuP1_mIjKp-oikVxw1o42ZQ",
  authDomain: "foodie-blog-daf41.firebaseapp.com",
  projectId: "foodie-blog-daf41",
  storageBucket: "foodie-blog-daf41.firebasestorage.app",
  messagingSenderId: "158336610558",
  appId: "1:158336610558:web:772ff0229b361f36c275af",
  measurementId: "G-KDBVD5FTBS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginGoogleBtn = document.getElementById("loginGoogleBtn");
const logoutBtn = document.getElementById("logoutBtn");
const postForm = document.getElementById("postForm");
const adminPostsContainer = document.getElementById("adminPostsContainer");

// ตรวจสอบการล็อกอิน
onAuthStateChanged(auth, (user) => {
  if(user){
    loginSection.style.display = "none";
    adminSection.style.display = "block";
    loadPosts();
  } else {
    loginSection.style.display = "block";
    adminSection.style.display = "none";
  }
});

// ล็อกอิน
loginGoogleBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider);
});

// ออกจากระบบ
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// สร้างโพสต์ใหม่
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;

  if(title && content){
    await addDoc(collection(db, "posts"), {
      title,
      content,
      createdAt: serverTimestamp()
    });
    postForm.reset();
    loadPosts();
  }
});

// โหลดโพสต์สำหรับ Admin
async function loadPosts(){
  adminPostsContainer.innerHTML = "";
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docItem) => {
    const data = docItem.data();
    const div = document.createElement("div");
    div.classList.add("review-card");
    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.content}</p>
      <button data-id="${docItem.id}" class="deleteBtn">ลบโพสต์</button>
    `;
    adminPostsContainer.appendChild(div);
  });

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "posts", btn.getAttribute("data-id")));
      loadPosts();
    });
  });
}
