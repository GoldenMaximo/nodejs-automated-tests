const { expect } = require('chai');

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
})