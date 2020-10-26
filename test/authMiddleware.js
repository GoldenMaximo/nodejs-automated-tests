const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/is-auth');

describe('Auth middleware', () => {
    it('Should throw an error if no authorization header is present', () => {
        const req = {
            get: (headerName) => {
                return null;
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Unauthorized');
    });

    it('Should throw an error if the authorization header is only one string', () => {
        const req = {
            get: (headerName) => {
                return 'test';
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it('should yield a userId after decoding the token', () => {
        const req = {
            get: (headerName) => {
                return 'Bearer test';
            }
        };

        // Instead of overriting methods from packages,
        //  sinon creates a "stub" in which you can configure it's return
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'abc' });
        authMiddleware(req, {}, () => {});

        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');

        // Useful if someone overrites the function call in the middleware file
        //  with just a value attribution to the return variable or something
        //   or if you add an if check and suddenly you don't make into that if check
        expect(jwt.verify.called).to.be.true;

        // And then after the test is completed,
        //  you can restore the package's functionality to it's original state
        //   so that it doesn't affect the following tests thereafter
        jwt.verify.restore();
    });

    it('Should throw an error if the token cannot be verified', () => {
        const req = {
            get: (headerName) => {
                return 'Bearer test';
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
})