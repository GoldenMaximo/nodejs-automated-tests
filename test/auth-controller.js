const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');
const StatusController = require('../controllers/status');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygqkk.mongodb.net/${process.env.TEST_DB_NAME}?retryWrites=true&w=majority`

describe('Auth Controller', () => {
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

    it('Should throw an error with code 500 if accessing the database fails', done => {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'test'
            }
        }

        AuthController.login(req, {}, () => { }).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        })

        User.findOne.restore();
    });

    it('Should send a response with a valid user status for an existing user', done => {
        const req = { userId: '5c0f66b979af55031b34728a' };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status
            }
        }

        StatusController.getStatus(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('I am new!');
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
