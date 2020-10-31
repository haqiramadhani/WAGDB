const {create} = require('@open-wa/wa-automate');
const express = require('express');

const {addSession, checkSession} = require("../../helper/store");

const v2 = express.Router();

const start = (data) => {
    create({
        autoRefresh: true,
        cacheEnabled: false,
        headless: true,
        hostNotificationLang: 'id-id',
        licenseKey: data.license || 'WAGATE',
        logConsoleErrors: true,
        qrRefreshS: 5,
        qrTimeout: 60,
        authTimeout: 60,
        restartOnCrash: () => start(data),
        sessionId: data.license || 'WAGATE',
        sessionData: data.sessionData || undefined,
        browserWSEndpoint: 'http://localhost:3000',
        disableSpins: true,
        qrLogSkip: true,
    })
        .then((client) => {
            client.onStateChanged((data) => (data === "CONFLICT" || data === "UNLAUNCHED") ? client.forceRefocus() : null)
                .then(null)
                .catch(null);
            addSession(data.license || 'WAGATE', client);
            v2.use(client.middleware(true));
        })
        .catch((e) => console.error(e.message));
};

const register = async (req, res) => {
    let data = {...req.params, ...req.headers, ...req.query, ...req.body, method: req.method};
    try {
        const exist = await checkSession(data.license)
        if (exist) return res.send('Success');
        else start(data);
    } catch (e) {
        console.log('src/controller/v1/register.js:43 =>', e.message)
    }
    res.sendFile(__dirname + '/index.html');
}

module.exports = {
    register,
    v2
};