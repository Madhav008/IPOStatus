import express from 'express'
const router = express.Router()

import { protect, admin } from '../middleware/authMiddleware.js'
import { downloadFile, getIpoList, getKarvyData, getbigshareData, getlinkintimeData } from '../controllers/sitesController.js'
import { checkCount } from '../middleware/checkCount.js'



router.get('/download/:fileName', downloadFile)
router.get('/getIpoList/:id', protect, getIpoList)
router.post('/karvy', protect, checkCount, getKarvyData)
router.post('/bigshare', protect, checkCount, getbigshareData)
router.post('/linkintime', protect, checkCount, getlinkintimeData)






export default router