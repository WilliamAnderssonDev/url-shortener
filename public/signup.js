const signup = new Vue(
    {
        el: '#signup',
        data:
        {
            email: '',
            password: '',
            error: '',
            created: null,
            formVisible: true,
        },
        methods:
        {
            async createAccount()
            {
                const response = await fetch('/signup',
                {
                    method: 'POST',
                    headers:
                    {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(
                    {
                        email: this.email,
                        password: this.password,
                    })
                });
                if (response.ok)
                {
                    const result = await response.json();
                    this.formVisible = false;
                    this.created = result;
                }
                else if (response.status === 429)
                {
                    this.error = 'You are sending too many requests. Try again in 10 seconds.';
                }
                else
                {
                    const result = await response.json();
                    this.error = result.message;
                }
            },
        },
    });