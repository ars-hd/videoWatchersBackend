const router = require('express').Router();
const { User, Video } = require('./models');
const { get_or_create_token, get_user_by_token } = require('./utils');


router.get('/', (req, res) => {
    res.status(200).send({
        message: 'Application is running',
        error: false,
    });
})


// Authentication
router.post('/register', async (req, res) => {
    let date = new Date().toISOString();
    const ip = req.socket.remoteAddress;
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).send({
                message: 'User already exists',
                error: true,
            });
        } else {
            user = await User.create({
                email: email,
                password: password,
                ip_address: ip,
                role: 'user',
                timestamp: date,
                credit: '0'
            })
            await user.save();
            let token = await get_or_create_token(user._id);
            return res.status(200).send({
                message: 'User created successfully',
                error: false,
                token: token,
                role: user.role,
                credit: user.credit || '0'
            })
        }
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            error: true
        })
    }
})

router.post('/login', async (req, res) => {
    const ip = req.socket.remoteAddress;
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email: email });
        if (user) {
            if (user.password === password) {
                let token = await get_or_create_token(user._id);
                return res.status(200).send({
                    message: 'User logged in successfully',
                    error: false,
                    token: token,
                    role: user.role,
                    credit: user.credit || '0'
                })
            } else {
                return res.status(400).send({
                    message: 'Incorrect password',
                    error: true
                })
            }
        } else {
            return res.status(400).send({
                message: 'User not found',
                error: true
            })
        }
    } catch (e) {
        return res.status(500).send({
            message: e.message,
            error: true
        })
    }
})

router.get('/profile', async (req, res) => {
    const ip = req.socket.remoteAddress;
    try {
        let user = await get_user_by_token(req.headers.authorization);
        if (user) {
            return res.status(200).send({
                message: 'User profile retrieved successfully',
                error: false,
                data: {
                    email: user.email,
                    token: req.headers.authorization
                }
            })
        } else {
            return res.status(400).send({
                message: 'User not found',
                error: true
            })
        }
    } catch (e) {
        return res.status(500).send({
            message: e.message,
            error: true
        })
    }
});

router.get('/profile/:id', async (req, res) => {
    const ip = req.socket.remoteAddress;
    try {
        let user = await get_user_by_token(req.headers.authorization);
        if (user) {
            try {
                let profile = await User.findOne({ _id: req.params.id });
                if (profile) {
                    return res.status(200).send({
                        message: 'User profile retrieved successfully',
                        error: false,
                        data: profile
                    })
                } else {
                    return res.status(400).send({
                        message: 'User not found',
                        error: true
                    })
                }
            } catch (e) {
                return res.status(500).send({
                    message: e.message,
                    error: true
                })
            }
        } else {
            return res.status(400).send({
                message: 'User not found',
                error: true
            })
        }
    } catch (e) {
        return res.status(500).send({
            message: e.message,
            error: true
        })
    }
})

router.get('/profiles', async (req, res) => {
    const ip = req.socket.remoteAddress;
    try {
        let user = await get_user_by_token(req.headers.authorization);
        if (user && user.role === 'admin') {
            try {
                let profiles = await User.find({});
                return res.status(200).send({
                    message: 'User profiles retrieved successfully',
                    error: false,
                    data: profiles
                })
            } catch (e) {
                return res.status(500).send({
                    message: e.message,
                    error: true
                })
            }
        } else {
            return res.status(400).send({
                message: 'User not found',
                error: true
            })
        }
    } catch (e) {
        return res.status(500).send({
            message: e.message,
            error: true
        })
    }
})




router.post('/videos', async (req, res) => {
    const ip = req.socket.remoteAddress;
    const { title, url, reward } = req.body;
    const owner = await get_user_by_token(req.headers.authorization);
    if (!owner || owner.role !== 'admin') {
        return res.status(400).send({
            message: 'User not found',
            error: true
        })
    }
    try {
        let video = await Video.create({
            title: title,
            url: url,
            owner: owner,
            status: 'active',
            reward: reward,
            watchers: [],
            timestamp: new Date().toISOString()
        })
        await video.save();
        return res.status(200).send({
            message: 'Video created successfully',
            error: false
        })
    } catch (e) {
        return res.status(500).send({
            message: e.message,
            error: true
        })
    }
})

router.get('/videos/active', async (req, res) => {
    let user = await get_user_by_token(req.headers.authorization);
    let videos = await Video.find({ status: 'active' });
    let vids_to_remove = [];
    for (let i = 0; i < videos.length; i++) {
        if (videos[i].watchers.includes(user._id)) {
            vids_to_remove.push(videos[i]);
        }
    }
    for (let i = 0; i < vids_to_remove.length; i++) {
        videos.splice(videos.indexOf(vids_to_remove[i]), 1);
    }
    return res.status(200).send({
        message: 'Videos retrieved successfully',
        error: false,
        data: videos
    })
})

router.get('/videos/all', async (req, res) => {
    let videos = await Video.find();
    return res.status(200).send({
        message: 'Videos retrieved successfully',
        error: false,
        data: videos
    })
})

router.post('/videos/:id', async (req, res) => {
    const ip = req.socket.remoteAddress;
    const { status, url, title } = req.body;
    const owner = await get_user_by_token(req.headers.authorization);
    if (!owner || owner.role !== 'admin') {
        return res.status(400).send({
            message: 'User not found',
            error: true
        })
    }
    try {
        let video = await Video.findOne({ _id: req.params.id });
        if (video) {
            video.title = title ? title : video.title;
            video.url = url ? url : video.url;
            video.status = status ? status : video.status;
            await video.save();
            return res.status(200).send({
                message: 'Video updated successfully',
                error: false
            })
        } else {
            return res.status(400).send({
                message: 'Video not found',
                error: true
            })
        }
    } catch (e) {
        return res.status(500).send({
            message: e.message,
            error: true
        })
    }
})

router.post('/videos/:id/watch', async (req, res) => {
    const user = await get_user_by_token(req.headers.authorization);
    if (!user) {
        return res.status(400).send({
            message: 'User not found',
            error: true
        })
    } else {
        let video = await Video.findOne({ _id: req.params.id });
        console.log(video.watchers);
        console.log(user.credit)
        if (video && !video.watchers.includes(user._id)) {
            video.watchers.push(user._id);
            user.credit = Number(user.credit) + Number(video.reward);
            await video.save();
            await user.save();
            return res.status(200).send({
                message: 'Video updated successfully',
                error: false,
                credit: user.credit
            })
        } else {
            return res.status(400).send({
                message: 'Video not found',
                error: true,
                credit: user.credit
            })
        }
    }
})

module.exports = router