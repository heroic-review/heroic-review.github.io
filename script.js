import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } 
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
const db = getFirestore(app);

const postsContainer = document.getElementById("postsContainer");

// โหลดโพสต์ทั้งหมด
async function loadPosts() {
  postsContainer.innerHTML = "";
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.classList.add("review-card");

    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.content}</p>
      <small>โพสต์เมื่อ: ${data.createdAt?.toDate().toLocaleString() || "N/A"}</small>
      <div class="comment-section">
        <h4>คอมเมนต์</h4>
        <div id="comments-${doc.id}"></div>
        <form data-id="${doc.id}" class="commentForm">
          <input type="text" placeholder="เขียนคอมเมนต์..." required>
          <button type="submit">ส่ง</button>
        </form>
      </div>
    `;

    postsContainer.appendChild(div);
    loadComments(doc.id);
  });

  // Event คอมเมนต์
  document.querySelectorAll(".commentForm").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const postId = form.getAttribute("data-id");
      const text = form.querySelector("input").value;
      if(text){
        await addDoc(collection(db, "posts", postId, "comments"), {
          text,
          createdAt: serverTimestamp()
        });
        form.reset();
        loadComments(postId);
      }
    });
  });
}

// โหลดคอมเมนต์
async function loadComments(postId){
  const container = document.getElementById(`comments-${postId}`);
  container.innerHTML = "";
  const q = query(collection(db, "posts", postId, "comments"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    const p = document.createElement("p");
    p.textContent = data.text;
    container.appendChild(p);
  });
}

loadPosts();
