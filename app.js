const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./res/routes');

const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/videoWatcher';

const app = express();

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}))
app.use('/api', router);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})