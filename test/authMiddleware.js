const { expect } = require('chai');

const authMiddleware = require('../middlewares/is-auth');

it('Should throw an error if no authorization header is present', () => {
    const req = {
        get: (headerName) => {
            return null;
        }
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Unauthorized');
});