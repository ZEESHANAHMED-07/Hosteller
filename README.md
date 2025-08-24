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

📂 Project Structure
Hosteller-main/
├── client/                 # React Native (Expo) mobile app
│   ├── src/                # Application source code
│   ├── assets/             # Images, icons, lottie animations
│   ├── constants/          # Global constants
│   ├── scripts/            # Utility scripts
│   ├── app.json            # Expo app config
│   ├── tailwind.config.js  # Tailwind/NativeWind styling
│   └── tsconfig.json       # TypeScript config
│
├── server/                 # Backend (Express.js + Firebase)
│   ├── index.js            # Entry point
│   └── package.json        # Backend dependencies
│
├── package.json            # Root dependencies (if any)
├── eas.json                # Expo build config
└── .gitignore

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


🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add new feature')

Push to branch (git push origin feature/amazing-feature)

Open a Pull Request

📜 License

Distributed under the MIT License. See LICENSE for more information.

🌟 Acknowledgements

Expo

Clerk

TailwindCSS

Firebase
