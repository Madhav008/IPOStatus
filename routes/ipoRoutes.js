import express from 'express'
const router = express.Router()

import { protect } from '../middleware/authMiddleware.js'
import { getIpoDetails, getIpoGraph, getIpoList } from '../controllers/ipoController.js'



router.get('/get/all', protect, getIpoList)
router.get('/get/:id', protect, getIpoDetails)
router.get('/get/view/:id', protect, getIpoGraph)




export default router