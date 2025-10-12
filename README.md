## 🪐 LinkOrbit – Cross-Platform Social Media Aggregator

### 🔗 Live Demo
<a href="https://link-orbit-one.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-blue?style=for-the-badge" alt="Demo Link"/>
</a>


LinkOrbit is a modern social media management platform that unifies content from multiple platforms like Instagram, Facebook, and LinkedIn into a single dashboard.
It enables users to create, schedule, analyze, and moderate their posts seamlessly — powered by Firebase and AI-driven insights.

The platform is built with an elegant dark navy blue theme with yellow-pink gradients, symbolizing trust, innovation, and creativity.

##  Problem Statement

In today’s digital world, content creators and brands juggle multiple platforms — wasting time logging in separately, analyzing metrics, and responding to comments.
They also risk posting harmful content without realizing it.

Challenges:

- Switching between multiple apps.
- Tracking engagement metrics separately.
- Managing comments manually.
- Accidentally posting risky or banned content.

##  Solution

- LinkOrbit provides an all-in-one platform where users can:
- Manage multiple social media accounts.
- Schedule and publish posts automatically.
- View performance analytics and engagement trends.
- Detect and prevent risky comments using Chatbot.
- Manage comments from all platforms in one place.


## 🎨 Design & Color Theme

| Element                | Color                     | Reason                                                    |
| ---------------------- | ------------------------- | --------------------------------------------------------- |
| **Primary Background** | Dark Navy Blue `#0b0f19`  | Represents trust, professionalism, and tech elegance.     |
| **Accent Gradient**    | Yellow → Pink             | Adds creativity, innovation, and energy to the interface. |
| **Typography**         | Simple & clean sans-serif | Improves readability and maintains a modern look.         |

## ✨ Core Features
1️⃣ Unified Feed
Combines posts from multiple platforms (Instagram, Facebook, LinkedIn) into a single, easy-to-read view.
Helps users manage and compare performance across platforms without switching tabs.

2️⃣ Post & Scheduler
Allows users to create, edit, and schedule posts.
Posts are stored in Firebase Firestore under platform-specific collections (instagram, facebook, linkedin, scheduledPosts), automatically published at the scheduled time.

3️⃣ Stats & Analytics
Tracks:
- Engagement trends
- Number of scheduled & published posts
- Platform-wise performance (Instagram, Facebook, LinkedIn)
- Posting time analysis
- Top hashtags
- Best-performing posts
- Provides valuable insights for smarter social media strategy.

4️⃣ Inbox / Comments Manager
Collects comments from all connected platforms in one place for quick responses.
Simplifies interaction and boosts engagement without switching between platforms.

5️⃣ AI Chatbot Risk Comment Detector
An AI-chatbot safety system that analyzes comments in real-time.
If a risky or offensive word is detected, it alerts the user before the comment is published — preventing account bans or penalties.

## 📁 Project File Structure

```text
SOCIALAGGREGATOR/
│
├── asset/                     # Images, icons, assets
│
├── chatbot/
│   └── bot.html               # AI chatbot risk detector
│
├── Dummy-social media/
│   ├── facebook.html          # Dummy Facebook interface
│   ├── instagram.html         # Dummy Instagram interface
│   └── linkedin.html          # Dummy LinkedIn interface
│
├── features/
│   ├── about.html             # About LinkOrbit section
│   ├── feature.html           # Main dashboard overview
│   ├── pricing.html           # Pricing & Plans page
│   └── pricing.css            # Pricing page styles
│
├── feeds/
│   ├── unified-feed.html      # Unified Feed showing all posts
│   ├── postAndSchedule.html   # Post creation & scheduling
│   ├── analytics.html         # Analytics & performance insights
│   ├── commentManager.html    # Comment Manager page
│   └── formstyle.css          # Feed styling
│
├── index.html                 # Landing page (login/signup + intro)
├── script.js                  # Firebase integration & UI logic
└── README.md                  # Project documentation
```


## ⚙️ Firebase Implementation
🔹 Firebase Modules Used:

- Firebase Authentication – For login/signup system.
- Enables secure email/password sign-in.
- Handles session persistence.
- Firestore Database – For real-time data storage.
- Stores posts for each dummy platform (instagram, facebook, linkedin) and scheduledPosts.
- Fetches posts dynamically into the Unified Feed.

Firebase Hosting (optional) – For deploying the web app online.

🔹 Key Functionalities:
- addDoc() → Adds new post data when user creates/schedules a post.
- getDocs() → Fetches all posts to display in the Unified Feed.
- query() & orderBy() → Used to sort posts by timestamp.
- onAuthStateChanged() → Keeps track of user login state.

🧮 DSA (Data Structures & Algorithms) Implementation

Though LinkOrbit is primarily web-based, DSA concepts are integrated for internal data handling and efficiency.
1. Array & Object Manipulation
Posts from different platforms are stored as arrays of objects.
These arrays are merged and sorted by date/time before rendering in the Unified Feed.
2. Sorting Algorithm
Used Merge Sort / Quick Sort logic for arranging posts chronologically.
Ensures scalability when multiple posts load simultaneously.
3. Hash Maps
Used in comment management for O(1) access to comment data linked to each post.
4. String Search Algorithm
Risk Comment Detector uses a string-matching algorithm to detect risky or banned words efficiently.
5. Queue Concept for Scheduled Posts
Posts waiting for scheduled publishing are managed like a queue,
where the earliest scheduled post is executed first.

## 💼 Business Strategy
## 🎯 Vision
- To become the go-to platform for creators, influencers, and marketing teams to manage their digital presence from one unified dashboard.
## 🧩 Market Gap Identified

Existing tools like Hootsuite or Buffer are expensive and often lack AI moderation features.
LinkOrbit fills this gap with:
- Affordable pricing.
- AI-based comment moderation.
- Simplified UI for beginners.

💰 Revenue Model
<img width="2030" height="610" alt="image" src="https://github.com/user-attachments/assets/45a7873f-1985-4892-a4c6-2a351c765c46" />


## Target Audience 
<img width="2022" height="1052" alt="image" src="https://github.com/user-attachments/assets/415ccf89-dbe4-488b-bd56-5e21639e9446" />


## Setup Process
### 🔹 Firebase Setup Process

1. Go to [Firebase Console](https://console.firebase.google.com/).  
2. Create a new project → “LinkOrbit”.  
3. Enable **Authentication → Sign-in Methods → Google & GitHub**.  
4. Go to **Firestore Database → Create Database** → set mode to “Test”.  
5. Copy your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

## Paste this config in your script.js file inside:

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
Enable Firestore Rules for read/write and deploy your project.
```

## 📈 Future Enhancements
- Real API integration for social media data
- Advanced AI comment risk prediction
- Multi-user collaboration dashboard
  
🚀 How to Run the Project
- Clone the repository:
- git clone https://github.com/Shweta-Tech-creator/LinkOrbit.git

-   ``` cd LinkOrbit ```
- Open the folder in VS Code.
Log in with Google or GitHub (Firebase Authentication must be enabled).
