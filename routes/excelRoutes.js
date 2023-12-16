import express from 'express'
const router = express.Router()

import { protect, admin } from '../middleware/authMiddleware.js'
import { getFolders, getResult, getTheFiles, getUploadedFileData } from '../controllers/excelController.js'



router.get('/all', getFolders)

// router.get('/:folder', getTheFiles)

router.get('/:pan', getResult)

router.post('/data', getUploadedFileData)







export default router