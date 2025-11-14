# Campus Connect 🎓

A private social networking platform designed for college students to connect, collaborate, and share experiences within their campus community. Built specifically for NITW (National Institute of Technology Warangal) students, Campus Connect provides a verified, safe space for students to interact with their peers, seniors, and join various campus groups.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Models](#models)
- [Contributing](#contributing)

## ✨ Features

### Authentication & Security
- **Email-based Registration**: Sign up using college email with OTP verification
- **Secure Login**: JWT-based authentication with password hashing
- **Protected Routes**: Middleware-based route protection

### Social Features
- **User Profiles**: Create and customize profiles with bio, skills, interests, and social links
- **Friend System**: Send, accept, and reject friend requests
- **User Search**: Find and connect with other students by name, branch, or year

### Content Management
- **Posts**: Create, view, and delete posts with image uploads
- **Quick Posts**: Share short updates (up to 280 characters)
- **Comments**: Comment on posts and engage in discussions
- **Likes**: Like posts, quick posts, and comments
- **Personalized Feed**: View posts based on your groups and connections

### Groups & Messaging
- **Auto-assigned Groups**: Automatic group assignment based on branch, class, section, and year
- **Custom Groups**: Admin-created groups for clubs and departments
- **Group Chat**: Real-time messaging within groups
- **Direct Messaging**: One-on-one private conversations

### Notifications
- Real-time notifications for likes, comments, friend requests, and group activities

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI library
- **React Router DOM**: Client-side routing
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API requests
- **React Toastify**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Multer**: File upload handling
- **Nodemailer**: Email service for OTP delivery

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v5.0 or higher)
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sami099k/campus-connect.git
   cd campus-connect
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## ⚙️ Configuration

### Server Configuration

1. Create a `.env` file in the `server` directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/campus_connect
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration (for OTP)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   ```

2. **MongoDB Setup**: Ensure MongoDB is running locally or update `MONGODB_URI` with your MongoDB connection string.

### Client Configuration

1. Create a `.env` file in the `client` directory (if needed):
   ```env
   VITE_API_URL=http://localhost:4000
   ```

## 🏃 Running the Application

### Development Mode

1. **Start the server** (in the `server` directory):
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:4000`

2. **Start the client** (in the `client` directory):
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:5173` (or another available port)

3. **Access the application**: Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Start the server**:
   ```bash
   cd ../server
   node index.js
   ```

## 📁 Project Structure

```
campus-connect/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context (AuthContext, etc.)
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Application entry point
│   ├── package.json
│   └── vite.config.js     # Vite configuration
│
├── server/                # Express backend
│   ├── config/           # Configuration files (database, mail)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware (auth, admin)
│   ├── models/           # Mongoose models
│   ├── Routes/           # API routes
│   ├── uploads/          # Uploaded files (avatars, posts)
│   ├── util/             # Utility functions
│   ├── docs/             # Documentation (SRS)
│   ├── index.js          # Server entry point
│   └── package.json
│
└── .gitignore
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (sends OTP)
- `POST /api/auth/verifyotp` - Verify OTP and create account
- `POST /api/auth/login` - Login with email and password

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/me` - Get current user's posts
- `GET /api/posts/:id` - Get a specific post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Toggle like on a post
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add a comment to a post

### Friends
- `POST /api/friends/request` - Send a friend request
- `PUT /api/friends/accept/:requestId` - Accept a friend request
- `PUT /api/friends/reject/:requestId` - Reject a friend request
- `GET /api/friends/requests/pending` - Get pending friend requests
- `GET /api/friends` - Get list of friends
- `GET /api/friends/search` - Search for users

### Groups
- `POST /api/groups` - Create a new group (admin only)
- `GET /api/groups/mine` - Get user's groups
- `GET /api/groups/:groupId` - Get group details

### Messages
- `POST /api/messages/group/:groupId` - Send a group message
- `GET /api/messages/group/:groupId` - Get group messages
- `POST /api/messages/dm/:userId` - Send a direct message
- `GET /api/messages/dm/:userId` - Get direct messages with a user

### User
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/:userId` - Get another user's profile

## 📊 Models

The application uses the following Mongoose models:

- **User**: User accounts with college email, profile details, and credentials
- **Group**: Campus groups (auto-assigned or custom)
- **Membership**: User-group relationships with roles
- **Post**: Long-form posts with title, content, and media
- **QuickPost**: Short text updates (≤280 characters)
- **Comment**: Comments on posts and quick posts
- **Like**: Likes on posts, quick posts, and comments
- **FriendRequest**: Friend request management
- **Message**: Direct and group messages
- **Notification**: User notifications
- **OTP**: One-time passwords for email verification

For detailed model schemas, see the [SRS documentation](server/docs/SRS.md).

## 🤝 Contributing

We welcome contributions to Campus Connect! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is part of an academic assignment for NITW. All rights reserved.

## 👥 Team

Campus Connect is developed by Group 8 as part of the Software Engineering course at NIT Warangal.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Note**: This is a student project designed for educational purposes and campus use. Ensure you have proper authorization before deploying in a production environment.
