# Crealix AI 🚀

<div align="center">
  <h3>The Ultimate Open-Source AI Suite for Instagram Creators</h3>
  <p>Crealix AI is a professional-grade, all-in-one content creation and growth platform designed specifically for Instagram creators, influencers, and brand managers. Built with a focus on speed, aesthetics, and multimodal AI capabilities.</p>

  <p align="center">
    <a href="https://github.com/shlok926/crealix-ai/stargazers"><img src="https://img.shields.io/github/stars/shlok926/crealix-ai?style=for-the-badge&color=yellow" alt="StarsBadge"/></a>
    <a href="https://github.com/shlok926/crealix-ai/network/members"><img src="https://img.shields.io/github/forks/shlok926/crealix-ai?style=for-the-badge&color=orange" alt="ForksBadge"/></a>
    <a href="https://github.com/shlok926/crealix-ai/issues"><img src="https://img.shields.io/github/issues/shlok926/crealix-ai?style=for-the-badge&color=red" alt="IssuesBadge"/></a>
    <a href="https://github.com/shlok926/crealix-ai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/shlok926/crealix-ai?style=for-the-badge&color=blue" alt="LicenseBadge"/></a>
  </p>
</div>

![Crealix AI Preview](https://via.placeholder.com/1200x600?text=Crealix+AI+-+The+Ultimate+Creator+Suite)

---

## ✨ Key Features

### 🎨 AI Image Studio (Flux.1)
Generate high-fidelity, viral-ready Instagram post images from simple text descriptions. Powered by **Flux.1**, the state-of-the-art model for professional photography and digital art.

### 📸 AI Vision Studio (Gemini 1.5 Flash)
Upload any photo and let Crealix AI analyze it to generate high-engagement captions, hooks, and niche-specific hashtags in seconds.

### 📋 Profile Audit 2.0
Get a deep strategic scan of your profile health. Crealix analyzes your metrics to provide a personalized **30-Day Growth Roadmap** and brand strategy report.

### ✨ Smart Content Generators
*   **Bio Generator:** Craft unique, conversion-focused bios in 8+ tones and 10+ niches.
*   **Caption Studio:** Write viral-ready captions with hook + body + CTA structures.
*   **Smart Hashtags:** AI-organized tags grouped by reach (Mega, Macro, Micro).
*   **Reel Scripts & Hooks:** Stop the scroll with AI-powered video concepts.
*   **Grid Planner Preview:** Visualize how your posts will look together.

### ☁️ Cloud Sync & Security
Integrated with **Firebase**, Crealix AI syncs your saved content across all devices. Your data is always backed up and accessible wherever you create.

---

## 🛠️ Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="Javascript" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white" alt="Firebase" />
  <img src="https://img.shields.io/badge/AI%20Models-Gemini%20%7C%20Flux.1-000000?style=for-the-badge&logo=openai&logoColor=white" alt="AI Engine" />
</div>

<br>

- **Frontend:** Vite + Vanilla JavaScript (ES6+)
- **Styling:** Advanced Vanilla CSS (Glassmorphism & Modern UI)
- **Database/Auth:** Firebase Firestore & Authentication
- **AI Engine:** Gemini 1.5 Flash, Flux.1 via OpenRouter

---

## 🚀 Getting Started

Follow these steps to run Crealix AI locally:

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Firebase Account** (for backend setup)
- **OpenRouter API Key** (for AI models access)

### 1. Clone the repository
```bash
git clone https://github.com/shlok926/crealix-ai.git
cd crealix-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory with your credentials:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="your_database_url"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"

# AI Models API
VITE_OPENROUTER_API_KEY="your_openrouter_key"
```

### 4. Run the development server
```bash
npm run dev
```

The app will be live at `http://localhost:5173` 🎉

### 5. Build for production
```bash
npm run build
```

---

## 🎯 Usage Guide

### Dashboard
- Overview of all your AI generation tools
- Quick access to saved content
- Profile growth metrics

### AI Image Generator
1. Enter a detailed prompt describing your desired Instagram post
2. Adjust parameters (style, quality, aspect ratio)
3. Click "Generate" and wait for Flux.1 to create your image
4. Download or save to cloud

### Vision Analyzer
1. Upload a photo from your device
2. Let Gemini 1.5 Flash analyze the image
3. Get instant captions, hashtags, and hooks
4. Copy directly or further customize

### Caption Studio
- **Hook Formulas:** Choose from proven engagement patterns
- **Hook + Body + CTA:** Complete caption structure
- **Tones:** Professional, Casual, Funny, Inspirational, etc.
- **Niches:** Fashion, Tech, Fitness, Food, Travel, etc.

---

## 📂 Project Structure

```text
crealix-ai/
├── public/
│   └── favicon.svg                    # App icon
├── src/
│   ├── components/
│   │   ├── modal.js                  # Reusable modal dialog
│   │   ├── navbar.js                 # Top navigation bar
│   │   ├── sidebar.js                # Left sidebar navigation
│   │   ├── preview.js                # Content preview component
│   │   ├── themeToggle.js            # Dark/light theme switcher
│   │   └── toast.js                  # Notification system
│   ├── pages/
│   │   ├── dashboard.js              # Main dashboard
│   │   ├── generator.js              # Caption generator
│   │   ├── image-generator.js        # Flux.1 image generation
│   │   ├── vision.js                 # Vision analysis tool
│   │   ├── audit.js                  # Profile audit analyzer
│   │   ├── hashtags.js               # Smart hashtag generator
│   │   ├── bulk-generator.js         # Bulk content generation
│   │   ├── captions.js               # Caption templates
│   │   ├── reel-script.js            # Reel script generator
│   │   ├── story-ideas.js            # Story content ideas
│   │   ├── templates.js              # Content templates library
│   │   ├── hooks.js                  # Hook formulas
│   │   ├── saved.js                  # Saved content manager
│   │   ├── home.js                   # Home/landing page
│   │   ├── login.js                  # Authentication
│   │   ├── onboarding.js             # User onboarding flow
│   │   └── username.js               # User profile setup
│   ├── services/
│   │   ├── firebase.js               # Firebase config & auth
│   │   ├── ai.js                     # AI model integration
│   │   ├── imageAi.js                # Image generation service
│   │   ├── cloudStorage.js           # Cloud file management
│   │   ├── clients.js                # API client helpers
│   │   └── userPlan.js               # User subscription management
│   ├── styles/
│   │   └── index.css                 # Global styles & animations
│   ├── utils/
│   │   ├── helpers.js                # Common utility functions
│   │   ├── storage.js                # Local storage management
│   │   ├── copy.js                   # Clipboard utilities
│   │   ├── featureGate.js            # Feature flags
│   │   ├── history.js                # Generation history
│   │   └── offline.js                # Offline mode support
│   └── main.js                        # App entry point
├── firestore.rules                    # Firebase security rules
├── index.html                         # HTML template
├── package.json                       # Dependencies
└── vite.config.js                     # Vite configuration
```

---

## ⚙️ API Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Google Authentication
5. Copy your config credentials to `.env`

### OpenRouter Setup
1. Sign up at [OpenRouter.ai](https://openrouter.ai/)
2. Generate an API key
3. Add it to your `.env` file
4. Available models: Gemini 1.5 Flash, Claude 3, Flux.1

---

## 🗺️ Roadmap

- [ ] **Mobile App** - React Native version for iOS & Android
- [ ] **Batch Posting** - Schedule multiple posts at once
- [ ] **Analytics Dashboard** - Real-time engagement tracking
- [ ] **Collaboration** - Team workspace & sharing
- [ ] **Premium Plans** - Advanced features & higher limits
- [ ] **API Documentation** - For third-party integrations
- [ ] **Browser Extension** - Quick caption generator for any website
- [ ] **AI Video Generation** - Automated reel creation

---

## ❓ FAQ

**Q: Is Crealix AI free to use?**
A: Yes! The core features are completely free. Premium features may be added in the future.

**Q: What AI models does Crealix use?**
A: We use Gemini 1.5 Flash (vision), Flux.1 (image generation), and Claude 3 (text) via OpenRouter.

**Q: Can I use generated content commercially?**
A: Yes, all generated content is yours to use. Please check OpenRouter's terms for specific model licenses.

**Q: Is my data secure?**
A: Yes! We use Firebase for secure storage, and all data is encrypted. We don't sell or share user data.

**Q: Can I self-host this?**
A: Yes! Clone the repo and deploy to Vercel, Netlify, or your own server.

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Firebase authentication not working
- Verify your `.env` file has correct Firebase credentials
- Check that Google Auth is enabled in Firebase Console
- Clear browser cache and reload

### Issue: Image generation takes too long
- OpenRouter API might be busy; try again in a few seconds
- Check your OpenRouter API key is valid
- Verify you have remaining API credits

### Issue: CSS styles not loading
```bash
# Rebuild the project
npm run build
# or restart dev server
npm run dev
```

---

## ❤️ Contributing

Contributions are what make the open source community amazing! We love your input.

### How to Contribute:
1. **Fork** the Project
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Areas to Contribute:
- 🐛 Bug fixes
- ✨ New features (hashtag strategies, reel formats, etc.)
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🤖 AI model integrations
- 🧪 Testing & quality assurance

---

## 👨‍💻 Author

Created and maintained by **[Shlok Thorat (@shlok926)](https://github.com/shlok926)**

- 💼 Full-Stack Developer | AI Enthusiast
- 🚀 Open Source Contributor
- 📧 Contact: shlok926@gmail.com

---

## 🤝 Community

Have suggestions or want to contribute? 
- **Star ⭐** this repository if you find it useful
- **Fork 🍴** to create your own version
- **Issues 🐛** - Report bugs or request features
- **Discussions 💬** - Share ideas and feedback

---

## 📄 License

Crealix AI is released under the **[MIT License](LICENSE)**. 

```text
MIT License - Feel free to use this project for personal or commercial purposes.
You can modify, distribute, and use the code with proper attribution.
```

---

## 💝 Support

If Crealix AI helped you create amazing content, consider:
- **Starring** ⭐ this repository
- **Sharing** 🔗 with fellow creators
- **Contributing** 💻 improvements or bug fixes
- **Sponsoring** 💖 the project (coming soon)

---

## 🙏 Acknowledgments

- **Gemini 1.5 Flash** - For vision analysis
- **Flux.1** - For high-quality image generation
- **Firebase** - For reliable backend infrastructure
- **OpenRouter** - For seamless AI model integration
- **Vite** - For blazing-fast development

---
<div align="center">
  <h3>⭐ Don't forget to star this repo if you found it helpful! ⭐</h3>
  <p><b>Built with ❤️ for the next generation of creators</b></p>
  <p>Power to the creative minds. 🚀</p>
</div>
