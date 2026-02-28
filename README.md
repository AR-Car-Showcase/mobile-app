# 🚗 AR Car Showcase

An immersive **Augmented Reality Car Showcase** mobile app built with **React Native**, **Expo**, and **ViroReact**. Browse a full car catalog, customize colors in a real-time 3D studio, and experience vehicles in your real-world environment through Augmented Reality.

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
| React Navigation | ^7.x |
| React Native Reanimated | ~4.1.1 |

---

## ✨ Features

- 🔭 **Augmented Reality** – View 3D car models in your real environment using ViroReact (ARCore/ARKit)
- 🎨 **Color Customization** – Customize car body, rims, interior, carbon fiber, and more per material slot
- 🚘 **3D Model Viewer** – Explore detailed `.glb` / `.obj` models with pinch-to-zoom and swipe-to-rotate
- 📱 **Cross-Platform** – Supports Android and iOS
- 🗂️ **File-Based Routing** – Powered by Expo Router for seamless navigation
- 🌗 **Light/Dark Theme** – System-aware theme that persists via AsyncStorage
- 🔐 **Auth-Gated Features** – Login-required modal for protected features (AR, saving, customizing)
- 🎞️ **Animated Tab Bar** – Smart scroll-aware tab bar that hides/shows on scroll
- 🤖 **AI Recommendations** – Personalized car suggestions based on user preferences

---

## 🏗️ Frontend Architecture

### Overview

The frontend is built using a **layered, context-driven architecture**. State management is handled entirely with React Context (no Redux), custom hooks abstract all 3D/scene logic, and Expo Router handles navigation via a file-based system.

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

## 🌐 System Architecture Diagram

```mermaid
graph TB
    subgraph "Mobile Client (React Native / Expo SDK 54+)"
        UI["User Interface (React Native Screens)"]
        Context["State Management (React Context API)"]
        API_Client["Network Layer (Fetch/AsyncStorage)"]

        subgraph "Interactive Engines"
            AR_Scene["AR Hybrid Scene (ViroReact)"]
            Studio_3D["3D Model Viewer (React Three Fiber)"]
            Gesture_Handler["Gesture Logic (Reanimated)"]
        end
    end

    subgraph "Distributed Backend (Cloud Hosted)"
        Main_Server["Spring Boot API (Java 17/Maven)"]
        Blender_Service["Blender Microservice (Python/Flask)"]
        Rec_Engine["Recommendation Engine (Java/PostgreSQL)"]
        DB[(PostgreSQL 15 / Persistence)]
    end

    UI --> Context
    Context --> API_Client
    API_Client <--> Main_Server

    UI --> AR_Scene
    UI --> Studio_3D
    Studio_3D --> Gesture_Handler
    AR_Scene --> Gesture_Handler

    Main_Server <--> DB
    Main_Server <--> Blender_Service
    Main_Server <--> Rec_Engine

    Blender_Service -.-> |"Binary GLB Stream"| AR_Scene
    Rec_Engine -.-> |"JSON Preferences"| UI
```

---

## 🔄 State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> Guest_State

    state Guest_State {
        [*] --> Home_Browse
        Home_Browse --> Details_View
        Details_View --> Home_Browse
        Details_View --> 3D_Studio_Limited
    }

    Guest_State --> Authenticated_State : Login Success

    state Authenticated_State {
        [*] --> Dashboard
        Dashboard --> Customization_Studio
        Customization_Studio --> AR_Mode
        AR_Mode --> Customization_Studio

        Dashboard --> Comparison_Tool
        Dashboard --> Personal_Showroom

        state Customization_Studio {
            [*] --> Exterior_View
            Exterior_View --> Interior_View
            Interior_View --> Exterior_View
        }
    }

    Authenticated_State --> Guest_State : Logout
```

---

## 🔄 Sequence Diagram: Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as LoginScreen
    participant AC as AuthContext
    participant CL as API Client
    participant S as Backend Server
    participant AS as AsyncStorage

    U->>UI: Enter Credentials
    UI->>AC: signIn(user, pass)
    AC->>CL: post('/auth/signin')
    CL->>S: POST /api/auth/signin
    S-->>CL: Response (JWT + User Data)
    CL-->>AC: Adapted Data

    alt Success
        AC->>AS: Save Token & User Body
        AC->>UI: Update Auth State
        UI->>U: Navigate to Home
    else Failure
        AC->>UI: Return Error Message
        UI->>U: Display Alert
    end
```

---

## 🔄 Sequence Diagram: 3D Studio & AR Flow

```mermaid
sequenceDiagram
    participant U as User
    participant HS as HybridScreen (3D Studio)
    participant CC as CarContext (React)
    participant CD as CustomizationDrawer
    participant AR as ARHybridScene (Viro)
    participant BV as Blender Microservice (Python)

    U->>HS: Select Car from Catalog
    HS->>CC: updateVehicle(carData)
    U->>HS: Toggle Customizer Workspace
    HS->>CD: mount(isPickerVisible=true)

    U->>CD: Modify Material Color (e.g. #FF0000)
    CD->>CC: updateMaterialColor(part, color)
    CC-->>HS: trigger(r3f-re-render)
    HS->>HS: Apply Material to Mesh Object

    U->>HS: Click "Apply to AR"
    HS->>BV: generateCustomModel(vehicleId, materials)
    activate BV
    BV->>BV: Load Base .blend
    BV->>BV: Update Cycles/Eevee Materials
    BV->>BV: Export .glb Stream
    BV-->>HS: Return Model Metadata & Filename
    deactivate BV

    HS->>HS: setGeneratedModelUrl(newUrl)
    HS->>HS: setViewMode('AR')
    HS->>AR: mount(viroAppProps)
    AR->>AR: initialize(ARSession)
    AR->>AR: fetch(customModelUrl)
    AR-->>U: Project Customized Car in AR
```

---

## 🔄 Sequence Diagram: Recommendation & Search Flow

```mermaid
sequenceDiagram
    participant U as User
    participant SC as Search/Home Screen
    participant AC as AuthContext
    participant RA as Recommendation API
    participant S as Spring Boot Server
    participant RE as Java Recommendation Engine

    U->>SC: Enter Search Query / View Home
    SC->>AC: Get User Preferences
    SC->>RA: getUserRecommendations()
    RA->>S: GET /api/recommendations/personalized
    S->>RE: Query Preferred Matches
    RE-->>S: List of Recommended Cars
    S-->>RA: JSON Data
    RA-->>SC: Map to UI Components
    SC->>U: Display "Recommended for You"

    U->>SC: Click on a Car
    SC->>RA: trackInteraction(carId, 'view')
    RA->>S: POST /api/recommendations/feedback
    S->>RE: Update User Behavior Model
```

---

## 📊 Class Diagram: Core Logic & Contexts

```mermaid
classDiagram
    class AuthContext {
        +User user
        +boolean isLoading
        +boolean isAuthenticated
        +signIn(username, password)
        +signUp(username, email, password)
        +signOut()
    }

    class CarContext {
        +CarConfig config
        +updateMaterialColor(name, hex)
        +updateVehicle(car)
        +resetCustomization()
    }

    class apiClient {
        +BASE_URL
        +get(endpoint, params)
        +post(endpoint, data)
        +setUnauthorizedHandler(fn)
    }

    class carsApi {
        +getAllCars()
        +getCarById(id)
        +searchCars(query)
    }

    class blenderService {
        +generateCustomModel(vehicleId, materials)
        +getModelUrl(filename)
    }

    class Car {
        +string id
        +string brand
        +string model
        +string fuelType
        +string transmissionType
        +CarImages images
        +string model3D
    }

    class Customization {
        +string id
        +string carId
        +Map materials
        +string generatedUrl
    }

    AuthContext ..> apiClient : uses
    CarContext ..> apiClient : uses
    carsApi ..> Car : fetches
    blenderService ..> apiClient : uses
    CarContext --> Car : manages selected
    CarContext --> Customization : tracks current
```

---

## 🎭 Use Case Diagram

```mermaid
graph TD
    User((User))
    Sys[Backend System / Microservices]

    subgraph "AR Car Showcase Application"
        UC1(Browse Car Catalog)
        UC2(View Detailed Specs)
        UC3(3D Customization Workspace)
        UC4(Hyper-Realistic AR Projection)
        UC5(Side-by-Side Comparison)
        UC6(AI-Driven Recommendations)
        UC7(Personal Showroom)
        UC8(Secure User Auth)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC5
    User --> UC7
    User --> UC8

    UC3 -.-> |includes| UC4
    UC2 -.-> |extends| UC6
    UC7 -.-> |requires| UC8
    UC3 -.-> |requires| UC8

    UC1 --- Sys
    UC3 --- Sys
    UC6 --- Sys
    UC7 --- Sys
    UC8 --- Sys
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android / iOS device or emulator with camera support

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

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - For full AR support, use a **development build**:
     ```bash
     npx expo run:android
     # or
     npx expo run:ios
     ```

---

## 📱 Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to blank project starter |

---

## 🎨 3D Customization: Material Slots

| Slot ID | Label |
|---|---|
| `CAR_BODY_PRIMARY` | Main Body |
| `CAR_BODY_SECONDARY` | Accent Finish |
| `CAR_INTERIOR_1` | Dashboard & Console |
| `CAR_INTERIOR_2` | Seat Upholstery |
| `CAR_INTERIOR_3` | Interior Trims |
| `CAR_RIM` | Wheel Rims |
| `CARBON_MATERIAL_1` | Carbon Fiber |

---

## ⚙️ R3F vs. ViroReact: The Hybrid Architecture

| Feature | React Three Fiber (R3F) | Viro React (AR) |
|---|---|---|
| **Environment** | Purely virtual (controlled studio) | Real-world camera feed |
| **Tracking** | None — controlled by touch gestures | 6DoF — tracks physical device movement |
| **Material Control** | Full Three.js scene graph access | Limited — model loaded as-is |
| **Use Case** | Customization studio | "Will this fit in my garage?" |

---

## 🔗 Related Repositories

- **[AR-Car-Showcase-Server](https://github.com/AdepuSriCharan/AR-Car-Showcase-Server)** – Spring Boot backend + Python Blender microservice

---

## 📄 License

This project is private.
