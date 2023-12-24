import express from 'express'
const router = express.Router()

import { protect, admin } from '../middleware/authMiddleware.js'
import { UploadTheData, getFolders, getResult, getTheFiles, getUploadedFileData } from '../controllers/excelController.js'
import { checkCount } from '../middleware/checkCount.js'



router.get('/all', protect, getFolders)

router.get('/:folder', protect, getTheFiles)

router.get('/pan/:pan', getResult)

router.post('/data', protect, checkCount, getUploadedFileData)

router.get('/upload/:folder', UploadTheData)








export default router