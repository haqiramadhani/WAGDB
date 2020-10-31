const axios = require('axios');
const { default: PQueue } = require("p-queue");

const {SESSION: SESSION_STORE} = require('../../helper/store');

console.log(SESSION_STORE);

const queue = new PQueue({
    concurrency: 4,
    autoStart: false
});

const send = async (req, res) => {
    console.log('masuk ke send =================== SEND ====================');
    let data = {...req.params, ...req.headers, ...req.query, ...req.body, method: req.method};
    try {
        let destinations = [], content;
        // stories
        if (data.to.includes('000001')) {
            console.log('story');
            destinations.push('story');
            content = data.content;
        }
        // broadcasts
        else if (data.to.includes('000002')) {
            console.log('broadcast');
            const code = data.content.substring(data.content.indexOf('['), data.content.indexOf(']') + 1);
            content = data.content.replace(code, '');
            const broadcastNames = code.substring(1, code.length - 1).split(',');
            const allChats = await SESSION_STORE[data.license].getAllChats();
            if (!broadcastNames.length) return res.status(400).send('Broadcast name is required in the content [Broadcast 001, Example 001]!');
            destinations = broadcastNames.map(name => {
                const broadcast = allChats.find(chat => chat.id.includes('@broadcast') && chat.name.toLowerCase() === name.toLowerCase());
                return broadcast.id;
            })
        }
        // groups
        else if (data.to.includes('000003')) {
            console.log('group');
            const code = data.content.substring(data.content.indexOf('['), data.content.indexOf(']') + 1);
            content = data.content.replace(code, '');
            const groupNames = code.substring(1, code.length - 1).split(',');
            const allChats = await SESSION_STORE[data.license].getAllChats();
            if (!groupNames.length) return res.status(400).send('Group name is required in the content [Broadcast 001, Example 001]!');
            destinations = groupNames.map(name => {
                const group = allChats.find(chat => chat.id.includes('@g.us') && chat.name.toLowerCase() === name.toLowerCase());
                return group.id;
            })
        }
        // private
        else {
            console.log('private');
            destinations.push(data.to);
            content = data.content;
        }
        const imageCode = content.substring(content.indexOf('{'), content.indexOf('}') + 1);
        if (imageCode) {
            content = content.replace(imageCode, '');
            const urls = imageCode.substring(1, imageCode.length - 1).split(',');
            for (const url of urls) {
                const resp = await axios.get(url, {responseType: 'arraybuffer'});
                const dataUrl = "data:" + resp.headers["content-type"] + ";base64," + Buffer.from(resp.data, 'binary').toString('base64');
                for (const destination of destinations) {
                    if (data.async) {
                        if (destination === 'story') await queue.add(() => {
                            SESSION_STORE[data.license]
                                .postImageStatus(dataUrl, content)
                                .then(null).catch(null);
                        });
                        else await queue.add(() => {
                            SESSION_STORE[data.license]
                                .sendImage(destination, dataUrl, 'random.png', '')
                                .then(null).catch(null);
                        });
                        res.send('Success add to queue');
                    } else {
                        if (destination === 'story') SESSION_STORE[data.license]
                            .postImageStatus(dataUrl, content)
                            .then(res.json)
                            .catch(e => res.send(e.message));
                        else SESSION_STORE[data.license]
                            .sendImage(destination, dataUrl, 'random.png', '')
                            .then(res.json)
                            .catch(e => res.send(e.message));
                    }
                }
            }
        }
        for (const destination of destinations) {
            if (data.async) {
                if (destination === 'story') await queue.add(() => {
                    SESSION_STORE[data.license]
                        .postTextStatus(content, '#FFFFFF', '#8294CA', 0)
                        .then(null).catch(null);
                });
                else await queue.add(() => {
                    SESSION_STORE[data.license]
                        .sendText(destination, content)
                        .then(null).catch(null);
                });
                res.send('Success add to queue');
            } else {
                if (destination === 'story' && !imageCode) SESSION_STORE[data.license]
                    .postTextStatus(content, '#FFFFFF', '#8294CA', 0)
                    .then(res.json)
                    .catch(e => res.send(e.message));
                else SESSION_STORE[data.license].sendText(destination, content)
                    .then(res.json)
                    .catch(e => res.send(e.message));
            }
        }
    } catch (e) {
        console.error(e.message);
    }
}

module.exports = send;