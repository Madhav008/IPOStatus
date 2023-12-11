import express from 'express'
const router = express.Router()

import { protect, admin } from '../middleware/authMiddleware.js'
import { downloadFile, getIpoList, getKarvyData, getbigshareData, getlinkintimeData } from '../controllers/sitesController.js'



router.get('/download/:fileName', protect, downloadFile)
router.get('/getIpoList/:id', protect, getIpoList)
router.get('/karvy', protect, getKarvyData)
router.post('/bigshare', protect, getbigshareData)
router.post('/linkintime', protect, getlinkintimeData)






export default router