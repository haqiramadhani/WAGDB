const express = require('express');

const {register} = require('../../controller/v1/register');
const send = require('../../controller/v1/send');

const router = express.Router();

router.use('/register', register);
router.use('/send', send);

module.exports = router;
