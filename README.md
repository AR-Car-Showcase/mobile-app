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
- 🎨 **Color Customization** – Customize car body, rims, interior, carbon fiber, and more per material slot
- 🚘 **3D Model Viewer** – Explore detailed `.glb` and `.obj` car models with pinch-to-zoom and swipe-to-rotate
- 📱 **Cross-Platform** – Supports Android, iOS and Web
- 🗂️ **File-Based Routing** – Powered by Expo Router for seamless navigation
- 🌗 **Light/Dark Theme** – System-aware theme that persists via AsyncStorage
- 🔐 **Auth-Gated Features** – Login-required modal for protected features (AR, saving, customizing)
- 🎞️ **Animated Tab Bar** – Smart scroll-aware tab bar that hides/shows on scroll

---

## 🏗️ Frontend Architecture

### Overview

The frontend is built using a **layered, context-driven architecture**. State management is handled entirely with React Context (no Redux), custom hooks abstract all 3D/scene logic, and Expo Router handles navigation using a file-based system.

```
┌─────────────────────────────────────────────────┐
│                   Expo Router                   │
│         (File-based Navigation + Layouts)        │
├─────────────────────────────────────────────────┤
│               React Context Layer               │
│  AuthContext │ CarContext │ ThemeContext │        │
│              ScrollContext                       │
├─────────────────────────────────────────────────┤
│              Screen / Page Layer                │
│  app/(main)/  │  app/auth/  │  app/scenes/      │
├─────────────────────────────────────────────────┤
│             Component Layer                     │
│  CarCard │ CustomizerScreen │ AnimatedTabBar     │
│  ColorPicker │ CustomizationDrawer │ Modals      │
├─────────────────────────────────────────────────┤
│             Custom Hooks Layer                  │
│  useModelSource │ useSceneMaterials              │
│  useTouchGestures │ useSceneCleanup              │
│  useSmartScroll                                  │
├─────────────────────────────────────────────────┤
│           3D / AR Rendering Layer               │
│  React Three Fiber Canvas │ ViroReact AR Scene  │
│  Three.js Materials & Scene Graph               │
└─────────────────────────────────────────────────┘
```

---

### 📂 Detailed Project Structure

```
AR-Car-Showcase/
│
├── app/                          # Expo Router root
│   ├── _layout.tsx               # Root layout — wraps app in all Providers
│   ├── polyfills.ts              # Web/RN compatibility polyfills
│   │
│   ├── (main)/                   # Main tab group (authenticated screens)
│   │   ├── index.tsx             # Home screen (featured cars)
│   │   ├── explore.tsx           # Search/browse cars
│   │   ├── saved.tsx             # Saved/favourited cars
│   │   └── profile.tsx           # User profile
│   │
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   │
│   ├── scenes/                   # AR scenes (ViroReact)
│   │   └── ARScene.tsx           # Main AR scene component
│   │
│   ├── context/                  # Global state (React Context)
│   │   ├── AuthContext.tsx       # JWT auth, user state, sign in/out
│   │   ├── CarContext.tsx        # Car selection + material color map
│   │   ├── ThemeContext.tsx      # Dark/light theme with persistence
│   │   └── ScrollContext.tsx     # Shared scroll position (Reanimated)
│   │
│   ├── hooks/                    # App-level hooks
│   │   └── useSmartScroll.ts     # Animated tab bar hide/show on scroll
│   │
│   └── services/
│       └── blenderService.ts     # API calls for Blender-processed models
│
├── components/                   # Reusable UI components
│   ├── AnimatedTabBar.tsx        # Custom bottom tab bar (scroll-aware)
│   ├── CarCard.tsx               # Car listing card (with GLTF preload)
│   ├── ColorPicker.tsx           # Per-material slot color picker
│   ├── ColorSlider.tsx           # Drag-to-pick color preset slider
│   ├── CustomizationDrawer.tsx   # Bottom sheet for car customization
│   ├── CustomizerScreen.tsx      # 3D canvas with scene controller
│   ├── InteriorSelector.tsx      # Interior material type selector
│   ├── LoginRequiredModal.tsx    # Gated feature auth prompt (BlurView)
│   └── WheelSelector.tsx         # Wheel style selector
│
├── hooks/                        # 3D scene hooks
│   ├── useModelSource.ts         # Resolves GLB/OBJ model URLs
│   ├── useSceneMaterials.ts      # Clones + applies colors to Three.js materials
│   ├── useSceneCleanup.ts        # Disposes geometries/textures on unmount
│   └── useTouchGestures.ts       # PanResponder for pinch-zoom + rotate
│
├── constants/
│   ├── Colors.ts                 # Dark/light theme color tokens
│   ├── CarModels.ts              # Model registry + configurable material names
│   └── ComponentStyles.ts        # Shared modal/list/card StyleSheet presets
│
├── types/
│   ├── car.ts                    # Car entity TypeScript type
│   └── errors.ts                 # API error types
│
├── api/
│   └── client.ts                 # Axios/fetch API client with auth interceptor
│
└── utils/                        # Utility functions
```

---

### 🧠 State Management — React Context

State is managed using four Context providers, all mounted at the root `_layout.tsx`:

| Context | Purpose |
|---|---|
| `AuthContext` | Stores JWT token + user object in AsyncStorage; exposes `signIn`, `signOut`, `signUp`, `fetchProfile` |
| `CarContext` | Tracks the selected car and a `MaterialColorMap` (material name → hex color), drives the 3D customizer |
| `ThemeContext` | Manages `dark` / `light` theme toggle, persists preference via AsyncStorage, reads system color scheme |
| `ScrollContext` | Shares a Reanimated `SharedValue<number>` for scroll position across the tab bar and screens |

---

### 🗂️ Routing — Expo Router (File-Based)

Navigation is entirely file-based using **Expo Router v6**:

- `app/_layout.tsx` — Root stack. Wraps the whole app in `AuthProvider`, `CarProvider`, `ThemeProvider`, `ScrollProvider`.
- `app/(main)/` — Tab group with 4 tabs: **Home**, **Explore**, **Saved**, **Profile**. Uses a custom `AnimatedTabBar`.
- `app/auth/` — Login and Signup screens, navigated to programmatically from `LoginRequiredModal`.
- `app/scenes/` — AR scene screens, launched from car detail pages.

---

### 🎨 3D Customizer Architecture

The 3D customizer is built around `CustomizerScreen.tsx`, which renders a **React Three Fiber `<Canvas>`**. Scene logic is split into focused custom hooks:

```
CustomizerScreen
 └── <Canvas>
      └── <Suspense>
           └── SceneController
                ├── useModelSource()       — resolves the .glb model URL
                ├── useGLTF()              — loads the 3D model
                ├── useSceneMaterials()    — clones materials, applies colors from CarContext
                ├── useSceneCleanup()      — disposes GPU resources on unmount
                └── useTouchGestures()     — PanResponder for rotate + pinch-zoom
```

**Material customization flow:**
1. User picks a material slot (e.g. `CAR_BODY_PRIMARY`) in `ColorPicker`
2. `CarContext.updateMaterialColor()` updates the `MaterialColorMap`
3. `useSceneMaterials` reacts to the updated config and calls `material.color.set(hexColor)` on the cloned Three.js material
4. Three.js re-renders the mesh with the new color in the next frame

**Key design decisions:**
- Materials are **cloned** (not mutated in place) to avoid cross-mesh color bleed
- Glass materials (detected by keyword: `glass`, `window`, `windshield`) are automatically made transparent (`opacity: 0.3`)
- LERP smoothing (`factor: 0.4`) is applied to rotation and camera movement for fluid animation

---

### 🧩 Component Design Patterns

- **`CarCard`** is wrapped in `React.memo` and proactively preloads the model with `useGLTF.preload()` on mount to reduce AR loading time.
- **`CustomizationDrawer`** is an animated bottom sheet driven by `Animated.spring` + `PanResponder`, with a drag-to-dismiss gesture.
- **`AnimatedTabBar`** uses a Reanimated `useAnimatedStyle` + `useSmartScroll` hook to slide the tab bar offscreen when scrolling down and back when scrolling up.
- **`LoginRequiredModal`** uses `expo-blur`'s `<BlurView>` for a glassmorphism effect and redirects to `/auth/login` or `/auth/signup`.
- **`ColorPicker`** supports both a wheel color picker and a manual HEX input field, with an internal `isInternalUpdate` ref to prevent circular update loops.
- **`ColorSlider`** is a fully custom drag-slider built on `PanResponder` + `Animated.Value`, snapping to 10 color presets (rainbow + Silver/White/Black).

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
