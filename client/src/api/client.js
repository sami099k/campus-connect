import axios from 'axios'
import { toast } from 'react-toastify'

const base = (import.meta.env.DEV
  ? '' // use Vite dev proxy
  : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
)

export const api = axios.create({
  baseURL: base + '/api',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    try {
      const method = (res?.config?.method || 'get').toLowerCase()
      const msg = res?.data?.message
      if (msg && method !== 'get') {
        toast.success(msg)
      }
    } catch {}
    return res
  },
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      // Token invalid/expired
      localStorage.removeItem('token')
      // Don't hard navigate in library; leave to pages
    }
    const msg = err?.response?.data?.error || err?.message
    if (msg) toast.error(msg)
    return Promise.reject(err)
  }
)

export const setToken = (token) => {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export const getToken = () => localStorage.getItem('token')

export const endpoints = {
  auth: {
    register: '/auth/register',
    verify: '/auth/verifyotp',
    login: '/auth/login',
  },
  posts: {
    root: '/posts',
    feed: '/posts/feed',
    mine: '/posts/me',
    byId: (id) => `/posts/${id}`,
    like: (id) => `/posts/${id}/like`,
    comments: (id) => `/posts/${id}/comments`,
  },
  friends: {
    root: '/friends',
    search: '/friends/search',
    pending: '/friends/requests/pending',
    request: '/friends/request',
    accept: (id) => `/friends/accept/${id}`,
    reject: (id) => `/friends/reject/${id}`,
  },
  user: {
    me: '/user/me',
    update: '/user/me',
    avatar: '/user/avatar',
  },
}
