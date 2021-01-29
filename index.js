// socket.io, express
const { create } = require('domain');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const host = process.env.PORT || 3000;

// tweet
const Twitter = require('twitter');

app.use(express.static(path.join(__dirname, 'public')));

let displayMessage = {
    verb: '',
    adjective: '',
    noun: '',
};

const client = new Twitter({
    consumer_key        : "QcmLYvqJyquMhAWsepc7Nv1it",
    consumer_secret     : "5CLFclfnqXuWHnmwzOtUSszkTYePlMziKu0agBYKd65r5uGeRH",
    access_token_key    : "1353707181414092802-izd0mEdFV6IqOrqH1k61znPSpNBK6w",
    access_token_secret : "sR1iWoMshzitcDsnjYefHA62H6BHxsN1Gtbf2lfTI7iJ7"
});

const validateSentence = () => {
    if (displayMessage.verb !== '' && 
        displayMessage.adjective !== '' &&
        displayMessage.noun !== '') {
        return true;
    }
    return false;
}

const createSentence = () => {
    return 'I ' + displayMessage.verb + ' a ' + displayMessage.adjective + ' ' + displayMessage.noun + '\n#WORD_IS_MINE';
}

const emitTweet = () => {
    client.post('statuses/update', { status: createSentence() }, function(error, tweet, response) {
        if(error) throw error;
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
    });
}

io.on('connection', (socket) => {
    socket.on('verb message', (msg) => {
        io.emit('verb message', msg);
        console.log('verb: ', msg);
        displayMessage.verb = msg;
        // 文章が完成したら自動的にツイートする
        if (validateSentence()) {
            emitTweet();
        }
    });
    socket.on('adjective message', (msg) => {
        io.emit('adjective message', msg);
        console.log('adjective: ', msg);
        displayMessage.adjective = msg;
        // 文章が完成したら自動的にツイートする
        if (validateSentence()) {
            emitTweet();
        }
    });
    socket.on('noun message', (msg) => {
        io.emit('noun message', msg);
        console.log('noun: ', msg);
        displayMessage.noun = msg;
        // 文章が完成したら自動的にツイートする
        if (validateSentence()) {
            emitTweet();
        }
    });

    // 新規ページアクセス時に呼び出される
    socket.on('join', () => {
        // 現在選択されている単語を新規ユーザーの入力画面にも反映する
        socket.emit('init', displayMessage);
    })
});

http.listen(host, () => {
    console.log('listening on *3000');
});