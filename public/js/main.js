var app = new Vue({
    el: '#app',
    data() {
        return {
            state: '', // 状態
            selectWords: [], // 選択肢として表示する単語
            verbWords: ['am', 'buy', 'choose', 'discover', 'eat',
                        'forget', 'get', 'hate', 'install', 'justify', 
                        'kill', 'love', 'miss', 'notice', 'own', 
                        'protect', 'quit', 'remember', 'shake', 'try',
                        'understand', 'verify', 'want', 'x-ray', 'yell', 'zoom'],      // 動詞の単語リスト
            adjectiveWords: ['academic', 'beautiful', 'crazy', 'dirty', 'easy',
                        'fake', 'good', 'handmade', 'ideal', 'juicy',
                        'kind', 'large', 'modern', 'negative', 'original',
                        'personal', 'quiet', 'rare', 'sexy', 'tiny', 
                        'ugly', 'violent', 'well-known', 'xeric', 'yummy', 'zigzag'],  // 形容詞の単語リスト
            nounWords: ['ant', 'boyfriend', 'child', 'document', 'elevator',
                        'fact', 'government', 'heaven', 'information', 'job',
                        'kitchen', 'life', 'mom', 'novel', 'october', 
                        'presentation', 'question', 'racist', 'secret', 'teacher',
                        'unicorn', 'voice', 'watermelon', 'xmas', 'yogurt', 'zoo'],    // 名詞の単語リスト
            displayWord: {
                verb: '',
                adjective: '',
                noun: '',
            },
            date: null,
            months: {
                0: 'JAN',
                1: 'FEB',
                2: 'MAR',
                3: 'APR',
                4: 'MAY',
                5: 'JUN',
                6: 'JUL',
                7: 'AUG',
                8: 'SEP',
                9: 'OCT',
                10: 'NOV',
                11: 'DEC',
            },
            socket: io(),
            maxDisplayWidth: 1000,
        }
    },
    computed: {
        article() { // 冠詞
            // 形容詞がa, i, u, e, oなら冠詞をanにする
            return this.displayWord.adjective.charAt(0) === 'a' ||
                    this.displayWord.adjective.charAt(0) === 'i' ||
                    this.displayWord.adjective.charAt(0) === 'u' ||
                    this.displayWord.adjective.charAt(0) === 'e' ||
                    this.displayWord.adjective.charAt(0) === 'o' 
                    ? 'AN' : 'A';
        },
        displayTime() {
            return this.date.getHours() + ':' + 
                    this.date.getMinutes() + ':' +
                    this.date.getSeconds();
        },
        displayDate() {
            return this.months[this.date.getMonth()] + ' ' +
                    this.date.getDate() + ', ' +
                    this.date.getFullYear();
        }
    },
    methods: {
        // stateの変更
        changeState(state) {
            this.state = state;
        },
        // wordの選択
        selectWord(word) {
            if (this.state === 'verb') {
                this.displayWord.verb = word;
                this.socket.emit('verb message', this.displayWord.verb);
            } else if (this.state === 'adjective') {
                this.displayWord.adjective = word;
                this.socket.emit('adjective message', this.displayWord.adjective);
            } else if (this.state === 'noun') {
                this.displayWord.noun = word;
                this.socket.emit('noun message', this.displayWord.noun);
            }
            this.controlDisplayWidth();
        },
        showTimer() {
            setInterval(() => {
                this.date = new Date();
                this.date.setHours(this.date.getHours() + 18); // JSTに合わせる
            }, 1000);
        },
        controlDisplayWidth() {
            console.log(this.$refs.display)
        }
    },
    watch: {
        state() {
            if (this.state === 'verb') {
                this.selectWords = this.verbWords;
            } else if (this.state === 'adjective') {
                this.selectWords = this.adjectiveWords;
            } else if (this.state === 'noun') {
                this.selectWords = this.nounWords;
            }
        },
    },
    created() {
        this.state = 'verb';
        this.date = new Date();
        this.date.setHours(this.date.getHours() + 18); // JSTに合わせる
        this.showTimer();

        // joinしたことを知らせる
        this.socket.emit('join');   
    },
    mounted() {
        this.socket.on('init', (displayMsg) => {
            this.displayWord.verb = displayMsg.verb;
            this.displayWord.adjective = displayMsg.adjective;
            this.displayWord.noun = displayMsg.noun;
        })
    }
});