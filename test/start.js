const { expect } = require('chai');

it('Should add numbers correctly', () => {
    const num1 = 2;
    const num2 = 3;

    expect(num1 + num2).to.equal(5);
});

it('Should not give a result of 17', () => {
    const num1 = 2;
    const num2 = 3;

    expect(num1 + num2).to.not.equal(6);
})