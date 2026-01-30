# Android Studio Setup Guide

This guide will help you run the **Try On App AR** mobile application using Android Studio's Emulator.

## Prerequisites

1.  **Android Studio**: Download and install from [developer.android.com](https://developer.android.com/studio).
2.  **Node.js**: Ensure Node.js is installed.
3.  **Expo CLI**: Installed globally or accessible via `npx`.

## Step 1: Set up Android Emulator

1.  Open **Android Studio**.
2.  Click on **More Actions** > **Virtual Device Manager** (or find it in the toolbar).
3.  Click **Create device**.
4.  Select a phone definition (e.g., **Pixel 6**) and click **Next**.
5.  Select a system image (e.g., **API 34** or **UpsideDownCake**) and click **Next**.
    *   *Note: You may need to download the image first by clicking the download icon next to the release name.*
6.  Click **Finish** to create the AVD (Android Virtual Device).
7.  Click the **Play** button in the Virtual Device Manager to launch the emulator.

## Step 2: Run the Application

1.  Open your terminal or command prompt.
2.  Navigate to the `mobile` directory of the project:
    ```bash
    cd mobile
    ```
3.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```
4.  Start the Expo development server:
    ```bash
    npx expo start --android
    ```
    *   *Alternatively, you can run `npx expo start` and then press `a` to open on Android.*

## Step 3: Troubleshooting

*   **"No Android device found"**: Ensure the emulator is running *before* you run the command. You can verify this by running `adb devices` in your terminal (requires platform-tools to be in your PATH).
*   **"Expo Go"**: The first time you run the app, it will install **Expo Go** on the emulator. Allow it to install.
*   **Network Issues**: If the app cannot connect to the backend, ensure your backend server is running (`npm run dev` in `server` folder) and that the mobile app is pointing to the correct IP address (usually your computer's local IP, e.g., `192.168.x.x`, instead of `localhost`).

## Running the Admin Dashboard

To manage products, run the web dashboard:

1.  Open a new terminal.
2.  Navigate to the `admin-web` directory:
    ```bash
    cd admin-web
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the web server:
    ```bash
    npm run dev
    ```
5.  Open the link shown (usually `http://localhost:5173`) in your browser.
