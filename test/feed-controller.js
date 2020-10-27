const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygqkk.mongodb.net/${process.env.TEST_DB_NAME}?retryWrites=true&w=majority`

describe('Feed Controller', () => {
    before(done => {
        mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            const user = new User({
                email: 'email@email.com',
                password: 'whatever',
                name: 'test',
                posts: [],
                _id: '5c0f66b979af55031b34728a'
            });

            return user.save();
        }).then(() => {
            done();
        });
    });

    it('Should add a created post to the posts of the creator', done => {
        const req = {
            body: {
                title: 'test post',
                content: 'test post',
            },
            userId: '5c0f66b979af55031b34728a',
            file: {
                path: 'xyz'
            },
        }

        const res = {
            status: function() {
                return this;
            },
            json: function() { }
        };

        FeedController.createPost(req, res, () => {}).then(savedUser => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
            done();
        });
    });

    after(done => {
        User.deleteMany({}).then(() => {
            return mongoose.disconnect();
        }).then(() => {
            done();
        });
    });
});
