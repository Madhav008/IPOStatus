import express from 'express'
const router = express.Router()

import { protect, admin } from '../middleware/authMiddleware.js'
import { UploadTheData, getFolders, getResult, getTheFiles, getUploadedFileData } from '../controllers/excelController.js'



router.get('/all', getFolders)

router.get('/:folder', getTheFiles)

router.get('/pan/:pan', getResult)

router.post('/data', getUploadedFileData)

router.get('/upload/:folder', UploadTheData)








export default router