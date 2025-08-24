🌐 Hosteller App

A modern networking and identity-sharing platform for hostel-goers, built with React Native (Expo) and Express.js.
Hosteller makes it simple to connect, share digital cards, manage profiles, and control privacy — all from a clean, user-friendly app.

✨ Features
🔐 Authentication & Verification

Signup/Login with phone verification

KYC verification (Full Name, DOB)

Account/data deletion

🎴 Digital Cards

Create & customize Business or Casual/Friend cards

Share cards seamlessly over Bluetooth

⚙️ Settings Panel

Security & Privacy controls

Profile picture visibility & display settings

Light/Dark mode themes

🖥️ Backend

Express.js + Firebase (Authentication & Firestore DB)

Clerk for authentication integration (if still used alongside Firebase)

API-ready structure for scalability

🛠️ Tech Stack

Frontend (client):

React Native (Expo)

Tailwind CSS (NativeWind)

Redux Toolkit

Lottie Animations

Backend (server):

Node.js + Express.js

Firebase (Auth, Firestore, Storage, etc.)

REST APIs

Other Tools:

EAS (Expo Application Services)

ESLint, TypeScript

⚡ Installation & Setup
Prerequisites

Node.js >= 18

Firebase project (Firestore, Auth, Storage enabled)

Expo Go (for testing on mobile)

1. Clone the repo
git clone https://github.com/yourusername/Hosteller.git
cd Hosteller-main

2. Setup Backend
cd server
npm install
# configure Firebase credentials in .env or serviceAccountKey.json
npm start

3. Setup Client
cd ../client
npm install
npx expo start


Scan the QR code with Expo Go to run the app on your device.


📜 License

Distributed under the MIT License. See LICENSE for more information.

🌟 Acknowledgements

Expo

Clerk

TailwindCSS

Firebase
