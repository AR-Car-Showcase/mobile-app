# 🚗 AR Car Showcase

An immersive **Augmented Reality Car Showcase** mobile app built with **React Native**, **Expo**, and **ViroReact**. Browse and explore 3D car models in augmented reality, customize colors, and experience vehicles like never before.

---

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| React Native | 0.81.5 |
| Expo | ~54.0.32 |
| Expo Router | ~6.0.22 |
| TypeScript | ~5.9.2 |
| ViroReact (`@reactvision/react-viro`) | ^2.43.6 |
| Three.js | ^0.182.0 |
| React Three Fiber | ^9.5.0 |
| React Three Drei | ^10.7.7 |

---

## ✨ Features

- 🔭 **Augmented Reality** – View 3D car models in your real environment using ViroReact
- 🎨 **Color Customization** – Customize car colors with an interactive color picker
- 🚘 **3D Model Viewer** – Explore detailed `.glb` and `.obj` car models
- 📱 **Cross-Platform** – Supports Android and iOS
- 🗂️ **File-Based Routing** – Powered by Expo Router for seamless navigation
- 🖼️ **Image Picker** – Select and use custom images within the app

---

## 📁 Project Structure

```
AR-Car-Showcase/
├── app/              # File-based routes (Expo Router)
├── api/              # API utilities
├── assets/           # Images, models, and other assets
├── components/       # Reusable UI components
├── constants/        # App-wide constants
├── hooks/            # Custom React hooks
├── scripts/          # Utility scripts
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
├── inspect_glb.js    # GLB model inspector utility
├── inspect_obj.js    # OBJ model inspector utility
├── app.json          # Expo app configuration
└── tsconfig.json     # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android or iOS device/emulator with AR support

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AdepuSriCharan/AR-Car-Showcase.git
   cd AR-Car-Showcase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the app**

   ```bash
   npx expo start
   ```

---

## 📲 Running on Devices

| Platform | Command |
|---|---|
| Android | `npm run android` |
| iOS | `npm run ios` |
| Web | `npm run web` |
| Expo Go | Scan QR code from `npx expo start` |

> ⚠️ **Note:** AR features require a physical device with ARCore (Android) or ARKit (iOS) support. AR may not work on emulators/simulators.

---

## 🧹 Linting

```bash
npm run lint
```

---

## 🔄 Reset Project

To reset the project to a blank state:

```bash
npm run reset-project
```

This moves the starter code to `app-example/` and creates a fresh `app/` directory.

---

## 📦 Key Dependencies

- [`@reactvision/react-viro`](https://github.com/NativeVision/viro) – AR/VR framework for React Native
- [`three`](https://threejs.org/) – 3D graphics library
- [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber) – React renderer for Three.js
- [`@react-three/drei`](https://github.com/pmndrs/drei) – Useful helpers for React Three Fiber
- [`expo-router`](https://expo.github.io/router) – File-based routing for Expo
- [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/) – Animations
- [`react-native-wheel-color-picker`](https://github.com/Naeemur/react-native-wheel-color-picker) – Color picker component

---

## 🌐 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [ViroReact Documentation](https://viro-community.readme.io/)
- [React Native Documentation](https://reactnative.dev/)
- [Three.js Documentation](https://threejs.org/docs/)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is private. All rights reserved.
