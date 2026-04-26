import { auth, db, storage } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
   uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const adminPanel = document.getElementById("adminPanel");
const clientPanel = document.getElementById("clientPanel");
const userRoleLabel = document.getElementById("userRoleLabel");
const logoutBtn = document.getElementById("logoutBtn");

const propertyForm = document.getElementById("propertyForm");
const progressForm = document.getElementById("progressForm");
const storyForm = document.getElementById("storyForm");

const adminPropertiesList = document.getElementById("adminPropertiesList");
const adminUpdatesList = document.getElementById("adminUpdatesList");
const adminStoriesList = document.getElementById("adminStoriesList");

const clientPropertyView = document.getElementById("clientPropertyView");
const clientUpdatesView = document.getElementById("clientUpdatesView");

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "portal.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "portal.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    alert("No user role found in Firestore users collection.");
    return;
  }

  const userData = userSnap.data();
  const role = userData.role;

  userRoleLabel.textContent = `Role: ${role}`;

  if (role === "admin") {
    adminPanel.classList.remove("hidden");
    await loadAllProperties();
    await loadAllUpdates();
    await loadAllStories();
  } else {
     clientPanel.classList.remove("hidden");
    await loadClientProperty(user.uid);
    await loadClientUpdates(user.uid);
  }
});

propertyForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientUid = document.getElementById("clientUid").value.trim();
  const clientName = document.getElementById("clientName").value.trim();
  const propertyAddress = document.getElementById("propertyAddress").value.trim();
  const propertyStage = document.getElementById("propertyStage").value.trim();
  const propertySummary = document.getElementById("propertySummary").value.trim();

  await setDoc(doc(db, "properties", clientUid), {
    clientUid,
    clientName,
    propertyAddress,
    propertyStage,
    propertySummary,
    updatedAt: serverTimestamp()
  });

  alert("Property assignment saved.");
  propertyForm.reset();
  await loadAllProperties();
});

progressForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientUid = document.getElementById("progressClientUid").value.trim();
  const updateTitle = document.getElementById("updateTitle").value.trim();
  const updateStatus = document.getElementById("updateStatus").value.trim();
   const updateNotes = document.getElementById("updateNotes").value.trim();
  const file = document.getElementById("updateImage").files[0];

  let imageUrl = "";

  if (file) {
    const fileRef = ref(storage, `progress-updates/${clientUid}/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    imageUrl = await getDownloadURL(fileRef);
  }

  await addDoc(collection(db, "propertyUpdates"), {
    clientUid,
    updateTitle,
    updateStatus,
    updateNotes,
    imageUrl,
    createdAt: serverTimestamp()
  });

  alert("Progress update saved.");
  progressForm.reset();
  await loadAllUpdates();
});

storyForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("storyTitle").value.trim();
  const summary = document.getElementById("storySummary").value.trim();
  const file = document.getElementById("storyImage").files[0];

  if (!file) {
    alert("Please choose a story image.");
    return;
  }

  const fileRef = ref(storage, `success-stories/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  const imageUrl = await getDownloadURL(fileRef);

  await addDoc(collection(db, "successStories"), {
    title,
    summary,
    imageUrl,
    createdAt: serverTimestamp()
  });

   alert("Success story uploaded.");
  storyForm.reset();
  await loadAllStories();
});

async function loadAllProperties() {
  adminPropertiesList.innerHTML = "";
  const snaps = await getDocs(collection(db, "properties"));

  snaps.forEach((itemDoc) => {
    const item = itemDoc.data();
    adminPropertiesList.innerHTML += `
      <div class="property-card">
        <h3>${item.clientName || ""}</h3>
        <p><strong>Client UID:</strong> ${item.clientUid || ""}</p>
        <p><strong>Address:</strong> ${item.propertyAddress || ""}</p>
        <p><strong>Stage:</strong> ${item.propertyStage || ""}</p>
        <p><strong>Summary:</strong> ${item.propertySummary || ""}</p>
      </div>
    `;
  });
}

async function loadAllUpdates() {
  adminUpdatesList.innerHTML = "";

  const q = query(collection(db, "propertyUpdates"), orderBy("createdAt", "desc"));
  const snaps = await getDocs(q);

  snaps.forEach((updateDoc) => {
    const item = updateDoc.data();

    adminUpdatesList.innerHTML += `
      <div class="update-card">
        <p class="update-date">${formatDate(item.createdAt)}</p>
        <h3>${item.updateTitle || ""}</h3>
        <p><strong>Client UID:</strong> ${item.clientUid || ""}</p>
        <p><strong>Status:</strong> ${item.updateStatus || ""}</p>
        <p>${item.updateNotes || ""}</p>
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="Progress update image">` : ""}
      </div>
    `;
  });
}

async function loadAllStories() {
  adminStoriesList.innerHTML = "";

  const q = query(collection(db, "successStories"), orderBy("createdAt", "desc"));
  const snaps = await getDocs(q);

  snaps.forEach((storyDoc) => {
    const story = storyDoc.data();
    adminStoriesList.innerHTML += `
      <div class="story-card">
        <h3>${story.title || ""}</h3>
        <p>${story.summary || ""}</p>
        ${story.imageUrl ? `<img src="${story.imageUrl}" alt="${story.title}">` : ""}
      </div>
    `;
  });
}

async function loadClientProperty(uid) {
  const docRef = doc(db, "properties", uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    clientPropertyView.innerHTML = "<p>No property assigned yet.</p>";
    return;
  }

  const item = snap.data();

  clientPropertyView.innerHTML = `
    <div class="property-card">
      <h3>${item.propertyAddress || ""}</h3>
      <p><strong>Current Stage:</strong> ${item.propertyStage || ""}</p>
      <p><strong>Summary:</strong> ${item.propertySummary || ""}</p>
    </div>
  `;
}

async function loadClientUpdates(uid) {
  clientUpdatesView.innerHTML = "";

  const q = query(
    collection(db, "propertyUpdates"),
    where("clientUid", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snaps = await getDocs(q);

  if (snaps.empty) {
    clientUpdatesView.innerHTML = "<p>No progress updates yet.</p>";
    return;
  }

  snaps.forEach((updateDoc) => {
    const item = updateDoc.data();

    clientUpdatesView.innerHTML += `
      <div class="update-card">
        <p class="update-date">${formatDate(item.createdAt)}</p>
        <h3>${item.updateTitle || ""}</h3>
        <p><strong>Status:</strong> ${item.updateStatus || ""}</p>
        <p>${item.updateNotes || ""}</p>
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="Progress update image">` : ""}
      </div>
    `;
  });
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "Pending timestamp";
  return timestamp.toDate().toLocaleString();
}
