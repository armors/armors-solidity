const TokenBlackHole = artifacts.require('TokenBlackHole');

contract('TokenBlackHole', function ([_, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    this.token = await TokenBlackHole.new();
  });

  describe('BlackHole', function () {
    it('returns the info', function () {
      const info = this.token.info();
      assert.notEqual(info.length, 0);
    });
  });
});
