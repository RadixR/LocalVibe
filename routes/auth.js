const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');

router.get('/register', ctrl.getRegister);
router.post('/register', ctrl.postRegister);

router.get('/login', ctrl.getLogin);
router.post('/login', ctrl.postLogin);

router.post('/logout', ctrl.logout);

module.exports = router; 