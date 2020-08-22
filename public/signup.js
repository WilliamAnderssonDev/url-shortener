var CryptoJS = require("crypto-js");
const app = new Vue({
    el: '#app',
    data: {
        email: '',
        password: '',
        error: '',
        created: null,
        formVisible: true,
        created: null
    },
    methods: {
        async createAccount() {
            console.log(this.email, this.password);
            
            var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase");
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.suffix,
                })
            });
        },
    },
});