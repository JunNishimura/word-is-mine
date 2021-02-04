var app = new Vue({
    el: '#output',
    data() {
        return {
            socket: io(),
            verb: '',
            adjective: '',
            noun: '',
            isSentenceComplete: false,
            videoFilePath: '', // 再生するvideoのファイル名 
            videoIndex: 0,     // senteceオブジェクトから値を取るためのインデックス
        }
    },
    computed: {
        article() { // 冠詞
            // 形容詞がa, i, u, e, oなら冠詞をanにする
            return this.adjective.charAt(0) === 'a' ||
                    this.adjective.charAt(0) === 'i' ||
                    this.adjective.charAt(0) === 'u' ||
                    this.adjective.charAt(0) === 'e' ||
                    this.adjective.charAt(0) === 'o' 
                    ? 'an' : 'a';
        },
        sentenceDict() {
            // 文章ができる度に配列を作り変えるのはコストがかかる
            // 動画再生に影響を出さないためにも、辞書型で要素だけを入れ替えるようにする
            return {
                0: 'I',
                1: this.verb,
                2: this.article,
                3: this.adjective,
                4: this.noun
            };
        }
    },
    mounted() {
        this.socket.on('verb message', (msg, d_time, d_date) => {
            this.verb = msg;
        });
        this.socket.on('adjective message', (msg, d_time, d_date) => {
            this.adjective = msg;
        });
        this.socket.on('noun message', (msg, d_time, d_date) => {
            this.noun = msg;
        });
        // output.htmlに入った時に、index.htmlで入力があった場合はそれを反映させる
        this.socket.on('init', (displayMessage) => {
            console.log("init");
            this.verb      = displayMessage.verb;
            this.adjective = displayMessage.adjective;
            this.noun      = displayMessage.noun;
            this.sentenceCheck();
        })
    },
    created() {
        // server側に新しくjoinしたことを通知する
        this.socket.emit('join');
    },
    methods: {
        sentenceCheck() {
            result = this.verb != null && this.adjective != null && this.noun != null
                    && this.verb.length > 0 && this.adjective.length > 0 && this.noun.length > 0;
            
            // 初めてsenteceが完成した時に動画の設定を初期化する
            if (!this.isSentenceComplete && result) {
                this.videoFilePath = "./img/video/I.mp4";
                this.videoIndex = 0;
                // this.$refs.video.play();
            }

            this.isSentenceComplete = result;
        },
        getNextVideo() {
            this.videoIndex = (this.videoIndex + 1) % 5;
            return this.sentenceDict[this.videoIndex];
        },
        changeVideo() {
            const nextVideo = this.getNextVideo(); // 次のvideo名を取得
            const filename = nextVideo + ".mp4";   // ファイル名に変換
            this.videoFilePath = "./img/video/" + filename; // 再生できるようにパスに変換
            console.log(this.videoFilePath)
        },
        onEnded() {
            // 文章が成立していないとreturn
            if (!this.isSentenceComplete) 
                return;
            
            console.log("ended");
            this.changeVideo();
        }
    },
    watch: {
        verb() {
            if (!this.isSentenceComplete)
                this.sentenceCheck();
        },
        adjective() {
            if (!this.isSentenceComplete)
                this.sentenceCheck();
        },
        noun() {
            if (!this.isSentenceComplete)
                this.sentenceCheck();
        },
    },
})