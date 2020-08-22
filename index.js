const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { nanoid } = require('nanoid');

require('dotenv').config();

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');
urls.createIndex({
    suffix: 1
}, {
    unique: true
});


const app = express();
app.enable('trust proxy');

//app.use(helmet());
app.use(morgan("common"));
//app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

app.get('/:id', async (req, res) => {
    const {
        id: suffix
    } = req.params;
    try {
        const url = await urls.findOne({
            suffix
        });
        if (url) {
            res.redirect(url.url);
        }
        res.redirect(`/?error=${suffix} not found`);
    } catch (error) {
        //res.redirect('/?error=Link not found');
    }
});


const schema = yup.object().shape({
    suffix: yup.string().trim().matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
});


app.post("/url", slowDown({
    windowMs: 10 * 1000,
    delayAfter: 1,
    delayMs: 500
}), rateLimit({
    windowMs: 10 * 1000,
    max: 1
}), async (req, res, next) => {
    let {
        suffix,
        url
    } = req.body;
    try {
        await schema.validate({
            suffix,
            url,
        });
        if (!suffix) {
            suffix = nanoid(6);
        }
        suffix = suffix.toLowerCase();
        const newUrl = {
            url,
            suffix,
        };
        const created = await urls.insert(newUrl);
        res.json(created);
    } catch (error) {
        if (error.message.startsWith('E11000')) {
            error.message = 'Egg in use!🥚';
        }
        if(error.message.startsWith('suffix must match the following')) {
            error.message = 'Egg can only contain: "A-Z", "0-9", "-", "_"';
        }
        next(error);
    }
});

app.post("/signup", slowDown({
    windowMs: 10 * 1000,
    delayAfter: 1,
    delayMs: 500
}), rateLimit({
    windowMs: 10 * 1000,
    max: 1
}), async (req, res, next) => {
    let { password, email } = req.body;
    console.log("A:", this.email, this.password);
});

app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥚' : error.stack,
    });
});

const port = process.env.PORT || 5000 ;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});