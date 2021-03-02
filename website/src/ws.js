'use strict';

const uuid = require('uuid');
const util = require('util');

const register = function (editor, deviceId) {
    const ws = new WebSocket('ws://websocket.serverless.fun:8080');
    const now = new Date();

    const reg = {
        method: 'GET',
        host: 'websocket.serverless.fun:8080',
        querys: {},
        headers: {
            'x-ca-websocket_api_type': ['REGISTER'],
            'x-ca-seq': ['0'],
            'x-ca-nonce': [uuid.v4().toString()],
            'date': [now.toUTCString()],
            'x-ca-timestamp': [now.getTime().toString()],
            'CA_VERSION': ['1'],
        },
        path: '/register',
        body: '',
    };

    ws.onopen = function open() {
        ws.send('RG#' + deviceId);
    };

    var registered = false;
    var registerResp = false;
    var hbStarted = false;

    ws.onmessage = function incoming(event) {
        if (event.data.startsWith('NF#')) {
            const msg = JSON.parse(event.data.substr(3));
            editor.addHistory(util.format('%s > %s', msg.from, msg.message));
            editor.setState({'prompt': deviceId + " > "});
            return;
        }

        if (!hbStarted && event.data.startsWith('RO#')) {
            console.log('Login successfully');

            if (!registered) {
                registered = true;
                ws.send(JSON.stringify(reg));
            }

            hbStarted = true;
            setInterval(function () {
                ws.send('H1');
            }, 15 * 1000);
            return;
        }

    };

    ws.onclose = function (event) {
        console.log('ws closed:', event);
    };
};

module.exports = register;
