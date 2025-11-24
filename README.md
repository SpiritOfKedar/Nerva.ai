# Nerva.ai - Your Mental Health Companion 🧠💚

Nerva.ai is an AI-powered mental health companion that provides empathetic support and guidance for your emotional well-being. Built with modern web technologies, it offers personalized mental health support through intelligent conversations, mood tracking, and interactive activities.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## ✨ Features

- 🤖 **AI-Powered Conversations**: Empathetic responses powered by Google's Generative AI (Gemini)
- 🎯 **Personalized Support**: Tailored mental health guidance based on your needs
- 📊 **Mood Tracking**: Track and visualize your emotional well-being over time
- 🎮 **Interactive Activities**: Anxiety-relief activities and therapeutic exercises
- 🔒 **Secure & Private**: JWT-based authentication with encrypted data storage
- 🌙 **Dark Mode**: Eye-friendly interface with theme support
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Project Structure

This is a monorepo containing two main applications:

```
Nerva.ai/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Auth & error handling
│   │   ├── inngest/       # Background job workflows
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── client/           # Next.js frontend application
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions & API clients
│   ├── public/          # Static assets
│   └── package.json
│
└── README.md        # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: TailwindCSS with custom animations
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **State Management**: React hooks
- **Authentication**: NextAuth.js with JWT

### Backend
- **Runtime**: Node.js with Express 5
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Generative AI (Gemini)
- **Background Jobs**: Inngest for workflow orchestration
- **Authentication**: JWT with bcrypt password hashing
- **Logging**: Winston for structured logging
- **Security**: Helmet.js, CORS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - You can use MongoDB Atlas (cloud) or a local installation
- **Git** - [Download](https://git-scm.com/)

## 🚀 Getting Started

Follow these steps to get Nerva.ai running on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Nerva.ai.git
cd Nerva.ai
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following environment variables to the `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nerva-ai
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/nerva-ai

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Generative AI (Gemini)
GOOGLE_API_KEY=your-google-gemini-api-key

# Inngest (for background jobs)
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
```

**How to get API keys:**

- **Google Gemini API Key**: 
  1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the key and paste it in your `.env` file

- **Inngest Keys** (Optional for development):
  1. Visit [Inngest Dashboard](https://www.inngest.com/)
  2. Sign up for a free account
  3. Create a new app and copy the keys
  4. For local development, you can use the Inngest Dev Server (see below)

#### Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start
```

The backend server will start on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal window/tab:

#### Install Dependencies

```bash
cd client
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `client` directory:

```bash
touch .env
```

Add the following environment variables:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3002`

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:3002
```

You should see the Nerva.ai landing page! 🎉

## 🔧 Development Tools

### Inngest Dev Server (Optional)

For local development of background jobs, you can use the Inngest Dev Server:

```bash
# In the backend directory
npx inngest-cli@latest dev
```

This will start the Inngest development dashboard at `http://localhost:8288`

### MongoDB Compass (Optional)

For a GUI to interact with your MongoDB database:

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse the `nerva-ai` database

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Chat Endpoints

- `POST /chat/message` - Send a message to the AI (requires authentication)
- `GET /chat/history` - Get chat history (requires authentication)

### Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## 🏗️ Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd client
npm run build
npm start
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution**: Kill the process using the port:
```bash
# Find the process
lsof -i :3001

# Kill it
kill -9 <PID>
```

**3. API Key Errors**
```
Error: API key not valid
```
**Solution**: Double-check your `.env` files and ensure all API keys are correctly set.

**4. Module Not Found**
```
Error: Cannot find module
```
**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📖 Learn More

### Technologies Used

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev/) - Learn React
- [TailwindCSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://docs.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [Google Generative AI](https://ai.google.dev/) - AI/ML platform
- [Inngest](https://www.inngest.com/docs) - Background job orchestration
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Google Generative AI for powering the conversational AI
- The open-source community for amazing tools and libraries
- Mental health professionals for guidance on therapeutic approaches

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Note**: This application is designed to provide supportive conversations and should not replace professional mental health care. If you're experiencing a mental health crisis, please contact a mental health professional or emergency services immediately.

**Crisis Resources**:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741 (US)
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

---

Made with ❤️ for mental health awareness
