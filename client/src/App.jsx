import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NavBar from './components/NavBar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Feed from './pages/Feed.jsx'
import ComposePost from './pages/ComposePost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Friends from './pages/Friends.jsx'
import Requests from './pages/Requests.jsx'
import SearchFriends from './pages/SearchFriends.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Groups from './pages/Groups.jsx'
import GroupChat from './pages/GroupChat.jsx'
import DirectChat from './pages/DirectChat.jsx'

import UserProfile from './pages/UserProfile.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <main className="page">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compose"
              element={
                <ProtectedRoute>
                  <ComposePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/:id"
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId/chat"
              element={
                <ProtectedRoute>
                  <GroupChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dm/:userId"
              element={
                <ProtectedRoute>
                  <DirectChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchFriends />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" theme="dark" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover draggable />
      </AuthProvider>
    </BrowserRouter>
  )
}
