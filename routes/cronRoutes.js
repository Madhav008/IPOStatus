import express from 'express'
const router = express.Router()

import { admin } from '../middleware/authMiddleware.js'
import { start, status, stop } from '../controllers/cronController.js'


router.get('/start', start)

router.get('/status', status)

router.get('/stop', stop)








export default router