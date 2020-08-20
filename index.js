const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const { nanoid } = require('nanoid');

require('dotenv').config();

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');
urls.createIndex({ suffix: 1 }, { unique: true });


const app = express();

app.use(helmet());
app.use(morgan("common"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

app.get('/:id', async(req, res) => {
    const { id: suffix } = req.params;
    try {
        const url = await urls.findOne({ suffix });
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

app.post("/url", async(req, res, next) => {
    let { suffix, url } = req.body;
    try {
        await schema.validate({
            suffix,
            url,
        });
        if (!suffix) {
            suffix = nanoid(5);
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
            error.message = 'Suffix in use. 🍔';
        }
        next(error);
    }
});

app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
});

const port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});