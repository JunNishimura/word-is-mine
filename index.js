// socket.io, express
const { create } = require('domain');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const host = process.env.PORT || 3000;
require('dotenv').config();

// tweet
const Twitter = require('twitter');

app.use(express.static(path.join(__dirname, 'public')));

let displayMessage = {
    verb: '',
    adjective: '',
    noun: '',
};

const client = new Twitter({
    consumer_key        : process.env.TWITTER_CONSUMER_KEY,
    consumer_secret     : process.env.TWITTER_CONSUMER_SECRET,
    access_token_key    : process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret : process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const validateSentence = () => {
    if (displayMessage.verb !== '' && 
        displayMessage.adjective !== '' &&
        displayMessage.noun !== '') {
        return true;
    }
    return false;
}

const article = (adj) => {
    // 形容詞がa, i, u, e, oなら冠詞をanにする
    return adj.charAt(0) === 'a' ||
            adj.charAt(0) === 'i' ||
            adj.charAt(0) === 'u' ||
            adj.charAt(0) === 'e' ||
            adj.charAt(0) === 'o' 
            ? 'AN' : 'A';
}

const createSentence = (d_date, d_time) => {
    let sentence = 'I ' + displayMessage.verb + ' ' + article(displayMessage.adjective) + ' ' + displayMessage.adjective + ' ' + displayMessage.noun + '\n\n';
    // sentence += d_date + '  ' + d_time + '\n';
    sentence += '#WORD_IS_MINE';

    return sentence;
}

const emitTweet = (d_date, d_time) => {
    client.post('statuses/update', { status: createSentence(d_date, d_time) }, function(error, tweet, response) {
        if(error) throw error;
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
    });
}

io.on('connection', (socket) => {
    socket.on('verb message', (msg, d_time, d_date) => {
        io.emit('verb message', msg, d_time, d_date);
        console.log('verb: ', msg);
        displayMessage.verb = msg;
        // 文章が完成したら自動的にツイートする
        if (validateSentence()) {
            emitTweet(d_time, d_date);
        }
    });
    socket.on('adjective message', (msg, d_time, d_date) => {
        io.emit('adjective message', msg, d_time, d_date);
        console.log('adjective: ', msg);
        displayMessage.adjective = msg;
        // 文章が完成したら自動的にツイートする
        if (validateSentence()) {
            emitTweet(d_time, d_date);
        }
    });
    socket.on('noun message', (msg, d_time, d_date) => {
        io.emit('noun message', msg, d_time, d_date);
        console.log('noun: ', msg);
        displayMessage.noun = msg;
        // 文章が完成したら自動的にツイートする
        if (validateSentence()) {
            emitTweet(d_time, d_date);
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