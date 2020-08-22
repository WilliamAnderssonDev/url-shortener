const app = new Vue({
    el: '#app',
    data: {
        url: '',
        suffix: '',
        error: '',
        created: null,
        formVisible: true,
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
            if (response.ok) {
                const result = await response.json();
                this.formVisible = false;
                this.created = `https://chkn.link/${result.suffix}`;
            } else if (response.status === 429) {
                this.error = 'You are sending too many requests. Try again in 10 seconds.';
            } else {
                const result = await response.json();
                this.error = result.message;
            }
        },
    },
});