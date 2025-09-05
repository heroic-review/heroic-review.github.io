import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Config ของคุณป๋อง
const firebaseConfig = {
    apiKey: "AIzaSyDaRh7fUTczSuP1_mIjKp-oikVxw1o42ZQ",
    authDomain: "foodie-blog-daf41.firebaseapp.com",
    projectId: "foodie-blog-daf41",
    storageBucket: "foodie-blog-daf41.appspot.com",
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

        // เพิ่มส่วนแสดงรูปภาพ
        let imagesHtml = "";
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            imagesHtml = `<div class = "img-slides">` +
                data.images.map(url => `<img src="${url}">`).join("") +
                `</div>`;
        }

        div.innerHTML = `
    <h3>${data.title}</h3>
    ${imagesHtml}
    <pre>${data.content}</pre>
    <div>
      <span class="read-more">อ่านเพิ่มเติม ▼</span>
    </div>
    <small>โพสต์เมื่อ: ${data.createdAt?.toDate().toLocaleString() || "N/A"}</small>
    <div class="comment-section">
      <h4>คอมเมนต์</h4>
      <div class="comments" id="comments-${doc.id}"></div>
    </div>
    <div clss="comment-form">
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
            if (text) {
                const name = await getUserName();
                if (!name) return; // ไม่กรอกชื่อ ไม่ส่งคอมเมนต์

                await addDoc(collection(db, "posts", postId, "comments"), {
                    text,
                    name,
                    createdAt: serverTimestamp()
                });
                form.reset();
                localStorage.removeItem("foodie_comment_name");
                loadComments(postId);
            }
        });
    });
}

// ฟังก์ชัน popup ถามชื่อและเก็บใน localStorage (ใช้ SweetAlert2)
async function getUserName() {
    let name = localStorage.getItem("foodie_comment_name");
    if (!name) {
        const { value } = await Swal.fire({
            title: 'กรุณากรอกชื่อที่จะแสดงในคอมเมนต์',
            input: 'text',
            inputLabel: 'ชื่อของคุณ',
            inputPlaceholder: 'ใส่ชื่อเล่น...',
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'กรุณากรอกชื่อ!';
                }
            }
        });
        if (value && value.trim()) {
            name = value.trim();
            localStorage.setItem("foodie_comment_name", name);
        } else {
            return null;
        }
    }
    return name;
}

// โหลดคอมเมนต์
async function loadComments(postId) {
    const container = document.getElementById(`comments-${postId}`);
    container.innerHTML = "";
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
        const data = doc.data();

        // สร้าง div คลุม avatar กับข้อความ
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment-item";

        if (data.name) {
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&size=32&rounded=true`;
            const avatar = document.createElement("img");
            avatar.src = avatarUrl;
            avatar.alt = "avatar";
            avatar.className = "avatar-comment";

            const p = document.createElement("p");
            p.innerHTML = `<strong>${escapeHtml(data.name)}:</strong> ${escapeHtml(data.text)}`;

            commentDiv.appendChild(avatar);
            commentDiv.appendChild(p);
        } else {
            const p = document.createElement("p");
            p.textContent = data.text;
            commentDiv.appendChild(p);
        }
        container.appendChild(commentDiv);
    });
}

// ป้องกัน XSS
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

loadPosts();
