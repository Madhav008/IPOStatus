import express from 'express'
const router = express.Router()
import {
    authUser,
    registerUser,
    getUserProfile,
    updateUserCount,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
} from '../controllers/userControllers.js'

import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(protect, admin, registerUser).get(protect, admin, getUsers)
router.post('/login', authUser)
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, admin, updateUserCount)
router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)

export default router