  type="module"
    // --- Firebase Setup ---
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


    const firebaseConfig = {
      apiKey: "AIzaSyD9ebL8xEeGjHOHxBsUtRY1IL65qm30zD4",
      authDomain: "social-f6c78.firebaseapp.com",
      projectId: "social-f6c78",
      storageBucket: "social-f6c78.appspot.com",

      messagingSenderId: "959340204769",
      appId: "1:959340204769:web:0e049a80321ea701a15da0",
      measurementId: "G-GCWJMNGPGN"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);


    // 🔹 Check if user is logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        document.getElementById("user-name").textContent = user.displayName || "Anonymous";
        document.getElementById("user-email").textContent = user.email || "";
        document.getElementById("user-pic").src = user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
      } else {
        document.getElementById("user-name").textContent = "Guest User";
        document.getElementById("user-email").textContent = "Not Logged In";
      }
    });

    // 🔹 Profile dropdown toggle
    const userPic = document.getElementById("user-pic");
    const menu = document.getElementById("profile-menu");

    userPic.addEventListener("click", () => {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // 🔹 Logout
    document.getElementById("logout-btn").addEventListener("click", () => {
      signOut(auth).then(() => {
        alert("Logged out!");
        window.location.href = "../index.html"; // redirect to homepage
      }).catch((err) => console.error("Logout error:", err));
    });

    // --- Fetch from multiple collections ---
    async function fetchPosts() {
      try {
        const collections = ["instagram", "facebook", "linkedin"];
        let allPosts = [];

        // 🔹 Fetch published posts
        for (let colName of collections) {
          const querySnapshot = await getDocs(collection(db, colName));
          querySnapshot.forEach(doc => {
            let data = doc.data();
            data.network = colName;
            data.status = "published";
            allPosts.push(data);
          });
        }

        // 🔹 Fetch scheduled posts
        const schedSnap = await getDocs(collection(db, "scheduledPosts"));
        schedSnap.forEach(doc => {
          let data = doc.data();
          data.network = data.networks ? data.networks.join(", ") : "scheduled";
          data.status = "scheduled";
          allPosts.push(data);
        });

        return allPosts;
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
      }
    }

    // --- DSA Helpers ---
    function countBy(posts, field) {
      const map = new Map();
      posts.forEach(p => {
        let key = p[field] || "Unknown";
        map.set(key, (map.get(key) || 0) + 1);
      });
      return map;
    }

    function getTopHashtags(posts, limit = 5) {
      const freq = new Map();
      posts.forEach(p => {
        (p.hashtags || []).forEach(tag => {
          freq.set(tag, (freq.get(tag) || 0) + 1);
        });
      });
      let arr = Array.from(freq.entries());
      arr.sort((a, b) => b[1] - a[1]);
      return arr.slice(0, limit);
    }

    function getEngagementRate(p) {
      const likes = Number(p.likes) || 0;
      const comments = Number(p.comments) || 0;
      const shares = Number(p.shares) || 0;
      const views = Number(p.views) || Number(p.reach) || 0;
      const total = likes + comments + shares;
      if (views <= 0) return 0;
      return (total / views) * 100;
    }

    function summarizeStats(posts) {
      const published = posts.filter(p => p.status?.toLowerCase() === "published").length;
      const scheduled = posts.filter(p => p.status?.toLowerCase() === "scheduled").length;
      const totalPosts = posts.length;

      const engagementSum = posts.reduce((sum, p) => sum + getEngagementRate(p), 0);
      const avgEngagement = posts.length > 0 ? (engagementSum / posts.length) : 0;

      return { totalPosts, scheduled, published, avgEngagement };
    }

    // --- NEW FEATURE: Best Performing Posts ---
    function renderBestPosts(posts) {
      const withEngagement = posts.map(p => ({ ...p, engagement: getEngagementRate(p) }));

      // ✅ DSA: sort (O(n log n)) → top 3
      withEngagement.sort((a, b) => b.engagement - a.engagement);
      const top3 = withEngagement.slice(0, 3);

      let html = "";
      top3.forEach((p, i) => {
        html += `
          <div class="best-post">
            <img src="${p.imageUrl || 'https://via.placeholder.com/80'}" alt="Post Image">
            <div class="info">
              <p><strong>Rank #${i + 1}</strong> (${p.network || "unknown"})</p>
              <p>${p.caption ? p.caption.substring(0, 50) + "..." : "No caption"}</p>
              <p>Engagement: ${p.engagement.toFixed(2)}%</p>
            </div>
          </div>
        `;
      });

      document.getElementById("bestPosts").innerHTML = html;
    }

    // --- NEW FEATURE: Posting Time Analysis ---
    function renderPostingTime(posts) {
      let engagementByHour = {}; // DSA: hashmap {hour -> [engagements]}

      posts.forEach(p => {
        let ts = p.timestamp || p.createdAt || p.publishedAt;
        if (ts?.seconds) {
          let date = new Date(ts.seconds * 1000);
          let hour = date.getHours();
          let rate = getEngagementRate(p);

          if (!engagementByHour[hour]) engagementByHour[hour] = [];
          engagementByHour[hour].push(rate);
        }
      });

      // ✅ Compute averages
      let labels = [];
      let avgEngagementByHour = [];
      for (let hour = 0; hour < 24; hour++) {
        labels.push(hour + ":00");
        if (engagementByHour[hour]) {
          let sum = engagementByHour[hour].reduce((a, b) => a + b, 0);
          avgEngagementByHour.push((sum / engagementByHour[hour].length).toFixed(2));
        } else {
          avgEngagementByHour.push(0);
        }
      }

      new Chart(document.getElementById("postingTimeAnalysis"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: "Avg Engagement (%)",
            data: avgEngagementByHour,
            borderColor: "blue",
            backgroundColor: "rgba(0,0,255,0.2)",
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Engagement (%)" } },
            x: { title: { display: true, text: "Hour of Day" } }
          }
        }
      });
    }

    // --- Chart Rendering ---
    function renderCharts(posts) {
      if (!posts.length) {
        document.getElementById("statsSummary").innerHTML = "<div class='stat'>⚠️ No posts found</div>";
        return;
      }

      const perNetwork = countBy(posts, "network");
      const scheduledCount = posts.filter(p => p.status?.toLowerCase() === "scheduled").length;
      const publishedCount = posts.filter(p => p.status?.toLowerCase() === "published").length;
      const hashtags = getTopHashtags(posts);

      const stats = summarizeStats(posts);
      document.getElementById("statsSummary").innerHTML = `
        <div class="stat">Total Posts<br>${stats.totalPosts}</div>
        <div class="stat">Published<br>${stats.published}</div>
        <div class="stat">Scheduled<br>${stats.scheduled}</div>
        <div class="stat">Avg Engagement<br>${stats.avgEngagement.toFixed(2)}%</div>
      `;

      // --- Chart 1: Posts per Network ---
      new Chart(document.getElementById("postsPerNetwork"), {
        type: "bar",
        data: {
          labels: [...perNetwork.keys()],
          datasets: [{
            label: "Posts",
            data: [...perNetwork.values()],
            backgroundColor: ["#E1306C", "#1877F2", "#0A66C2"]
          }]
        }
      });

      // --- Chart 2: Scheduled vs Published ---
      new Chart(document.getElementById("scheduledVsPublished"), {
        type: "pie",
        data: {
          labels: ["Scheduled", "Published"],
          datasets: [{
            data: [scheduledCount, publishedCount],
            backgroundColor: ["#f39c12", "#27ae60"]
          }]
        }
      });

      // --- Chart 3: Engagement + Likes/Comments/Views trend ---
      const byDate = {};
      posts.forEach(p => {
        let ts = p.timestamp || p.createdAt || p.publishedAt;
        let date;

        if (ts?.seconds) {
          date = new Date(ts.seconds * 1000).toLocaleDateString();
        } else {
          date = new Date().toLocaleDateString();
        }

        if (!byDate[date]) {
          byDate[date] = { engagement: 0, likes: 0, comments: 0, views: 0, count: 0 };
        }

        byDate[date].engagement += getEngagementRate(p);
        byDate[date].likes += p.likes || 0;
        byDate[date].comments += p.comments || 0;
        byDate[date].views += p.views || 0;
        byDate[date].count++;
      });

      const labels = Object.keys(byDate);
      const engagementData = labels.map(d => byDate[d].engagement / byDate[d].count);
      const likesData = labels.map(d => byDate[d].likes);
      const commentsData = labels.map(d => byDate[d].comments);
      const viewsData = labels.map(d => byDate[d].views);

      new Chart(document.getElementById("engagementTrend"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Engagement %",
              data: engagementData,
              borderColor: "orange",
              backgroundColor: "rgba(255,165,0,0.3)",
              yAxisID: "y1"
            },
            {
              label: "Likes",
              data: likesData,
              borderColor: "green",
              backgroundColor: "rgba(0,255,0,0.3)",
              yAxisID: "y2"
            },
            {
              label: "Comments",
              data: commentsData,
              borderColor: "blue",
              backgroundColor: "rgba(0,0,255,0.3)",
              yAxisID: "y2"
            },
            {
              label: "Views",
              data: viewsData,
              borderColor: "purple",
              backgroundColor: "rgba(128,0,128,0.3)",
              yAxisID: "y2"
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y1: {
              type: "linear",
              position: "left",
              title: { display: true, text: "Engagement %" },
              min: 0,
              max: 100
            },
            y2: {
              type: "linear",
              position: "right",
              title: { display: true, text: "Counts (Likes, Comments, Views)" },
              grid: { drawOnChartArea: false }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  if (ctx.dataset.label === "Engagement %") {
                    return `${ctx.parsed.y.toFixed(2)}%`;
                  }
                  return `${ctx.dataset.label}: ${ctx.parsed.y}`;
                }
              }
            }
          }
        }
      });

      // --- Chart 4: Top Hashtags ---
      new Chart(document.getElementById("topHashtags"), {
        type: "bar",
        data: {
          labels: hashtags.map(h => h[0]),
          datasets: [{
            label: "Mentions",
            data: hashtags.map(h => h[1]),
            backgroundColor: "#9b59b6"
          }]
        }
      });

      // --- NEW CALLS ---
      renderBestPosts(posts);
      renderPostingTime(posts);
    }

    // --- Run ---
    fetchPosts().then(renderCharts);
