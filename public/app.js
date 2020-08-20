const app = new Vue({
    el: '#app',
    data: {
        url: '',
        suffix: '',
        error: '',
        created: null,
        formVisible: true,
        created: null
    },
    methods: {
        async createUrl() {
            console.log(this.url, this.suffix);
            const response = await fetch('/url', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    url: this.url,
                    suffix: this.suffix || undefined,
                })
            });
            this.created = await response.json();          
        }
    }
});