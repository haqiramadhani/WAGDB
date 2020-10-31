const express = require('express');

const v1 = require('./v1');
const {v2} = require('../controller/v1/register');

const router = express.Router();

router.use('/api/v1', v1);
router.use('/api/v2', v2);
// router.use('/images/:filename', image);
router.get('/', ((req, res) => {
    res.send(`
    <head>
        <title>WAGATE - Welcome</title>
    </head>
    <body>
        <h1>Welcome to WAGATE</h1>
        <p>Powered by <a href="//linkedin.com/in/haqiramadhani">Haqi Ramadhani</a></p>
    </body>
    `);
}));

module.exports = router;