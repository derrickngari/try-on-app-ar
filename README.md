# 🛋️ AR Home Decor Try-On App

> Visualize furniture and home décor in your own space — before you buy.

---

## Overview

The AR Home Decor Try-On App lets users shop for furniture and home décor with confidence. Upload a photo of your room, pick a piece of furniture — a sofa, chair, table, or any décor item — and the app uses **Google Gemini** to intelligently composite the object into your scene. You see exactly how it would look in your home before making a purchase.

**Key capabilities:**
- Upload a photo of any room or space
- Browse and select furniture/home décor items (chairs, sofas, tables, lamps, etc.)
- AI-powered scene composition using Google Gemini
- Realistic preview of how items fit your space in terms of scale and style
- Built with React Native for a seamless mobile experience

---

## Tech Stack

- **Frontend:** React Native
- **AI / Scene Composition:** Google Gemini (nano)
- **Platform:** iOS & Android

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Xcode](https://developer.apple.com/xcode/) (for iOS) or [Android Studio](https://developer.android.com/studio) (for Android)
- A Google Gemini API key — get one at [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/derrickngari/try-on-app-ar.git
   cd try-on-app-ar
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root of the project and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run on iOS**

   ```bash
   npx react-native run-ios
   ```

5. **Run on Android**

   ```bash
   npx react-native run-android
   ```

---

## Usage

1. **Open the app** on your device or simulator.
2. **Take or upload a photo** of the room or space you want to decorate.
3. **Browse the catalogue** and select a furniture item (e.g. sofa, armchair, coffee table).
4. **Preview the result** — the app uses Google Gemini to place the item realistically into your scene.
5. **Adjust or swap** items until you're happy with the look.

---

## Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes** with a clear message
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** and describe what you've changed and why

Please make sure your code is clean, well-commented, and doesn't break existing functionality. For major changes, open an issue first to discuss your idea.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

Built by [Derrick Ngari](https://github.com/derrickngari) & [Godfrey Mbugua](https://github.com/GODFREYnganga)
