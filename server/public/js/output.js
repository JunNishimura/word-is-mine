var app = new Vue({
    el: '#output',
    data() {
        return {
            socket: io(),
            verb: '',
            adjective: '',
            noun: '',
            isSentenceComplete: false
        }
    },
    mounted() {
        this.socket.on('verb message', (msg) => {
            this.verb = msg;
        });
        this.socket.on('adjective message', (msg) => {
            this.adjective = msg;
        });
        this.socket.on('noun message', (msg) => {
            this.noun = msg;
        });
    },
    methods: {
        sentenceCheck() {
            return this.verb != null && this.adjective != null && this.noun != null
                    && this.verb.length > 0 && this.adjective.length > 0 && this.noun.length > 0;
        }
    },
    watch: {
        verb() {
            this.isSentenceComplete = this.sentenceCheck();
            console.log(this.isSentenceComplete);
        },
        adjective() {
            this.isSentenceComplete = this.sentenceCheck();
            console.log(this.isSentenceComplete);
        },
        noun() {
            this.isSentenceComplete = this.sentenceCheck();
            console.log(this.isSentenceComplete);
        }
    }
})