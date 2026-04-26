import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const grid = document.getElementById("successStoriesGrid");

async function loadStories() {
  if (!grid) return;

  try {
    const q = query(collection(db, "successStories"), orderBy("createdAt", "desc"));
    const snaps = await getDocs(q);

    if (snaps.empty) {
       grid.innerHTML = "<p class='center'>No success stories published yet.</p>";
      return;
    }

    grid.innerHTML = "";

    snaps.forEach((docSnap) => {
      const story = docSnap.data();

      grid.innerHTML += `
        <article class="story-public-card">
          ${story.imageUrl ? `<img src="${story.imageUrl}" alt="${story.title || "Success story"}">` : ""}
          <div class="story-public-body">
            <h3>${story.title || ""}</h3>
            <p>${story.summary || ""}</p>
          </div>
        </article>
      `;
    });
  } catch (error) {
    grid.innerHTML = "<p class='center'>Could not load success stories yet.</p>";
    console.error(error);
  }
}

loadStories();
