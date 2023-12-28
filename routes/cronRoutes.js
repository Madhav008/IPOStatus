import express from 'express'
const router = express.Router()

import { admin } from '../middleware/authMiddleware.js'
import { start, startRefill, startheaders, status, statusRefill, statusheaders, stop, stopRefill, stopheaders } from '../controllers/cronController.js'


router.get('/start', start)

router.get('/status', status)

router.get('/stop', stop)


router.get('/refil/start', startRefill)

router.get('/refil/status', statusRefill)

router.get('/refil/stop', stopRefill)


router.get('/headers/start', startheaders)

router.get('/headers/status', statusheaders)

router.get('/headers/stop', stopheaders)






export default router