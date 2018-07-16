
import assertRevert from './helpers/assertRevert';

const StandardTokenMock = artifacts.require('StandardTokenMock');

const Ownable = artifacts.require('Ownable');

const TokenBatchTransfer = artifacts.require('TokenBatchTransfer');

contract('TokenBatchTransfer', function ([_, owner, recipient, anotherAccount, thirdAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  beforeEach(async function () {
    this.token = await StandardTokenMock.new(owner, 10000);
    this.ownable = await Ownable.new();
    this.tokenBatch = await TokenBatchTransfer.new(this.token.address);
  });

  describe('token', function () {
    it('When the token is StandardTokenMock adress', async function () {
      const tokenAddress = await this.tokenBatch.token();

      assert.equal(tokenAddress, this.token.address);
    });
  });

  describe('balanceOfToken', function () {
    it('When the TokenBatchTransfe contract has no token', async function () {
      const balance = await this.tokenBatch.balanceOfToken();
      assert.equal(balance, 0);
    });
  });

  describe('changeToken', function () {
    it('When change token', async function () {
      await this.tokenBatch.changeToken(this.ownable.address);
      const tokenAddress = await this.tokenBatch.token();
      assert.equal(tokenAddress, this.ownable.address);
    });
  });

  describe('safeTransfer', function () {
    it('When the TokenBatchTransfer has some tokens', async function () {
      await this.token.transfer(this.tokenBatch.address, 100, { from: owner });

      const balance = await this.tokenBatch.balanceOfToken();
      assert.equal(balance, 100);

      await this.tokenBatch.safeTransfer(recipient, 10);

      const balance1 = await this.tokenBatch.balanceOfToken();
      assert.equal(balance1, 90);

      const balance2 = await this.token.balanceOf(recipient);
      assert.equal(balance2, 10);
    });

    describe('When the TokenBatchTransfer has no tokens', function () {
      it('reverts', async function () {
        await assertRevert(this.tokenBatch.safeTransfer(recipient, 10));
      });
    });
    describe('When the sender is not owner', function () {
      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 10000, { from: owner });
        await assertRevert(this.tokenBatch.safeTransfer(recipient, 10, { from: anotherAccount }));
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 100, { from: owner });
        await assertRevert(this.tokenBatch.safeTransfer(to, 10));
      });
    });
  });

  describe('batchTransfer', function () {
    it('When the TokenBatchTransfer has some tokens', async function () {
      await this.token.transfer(this.tokenBatch.address, 10000, { from: owner });

      const balance = await this.tokenBatch.balanceOfToken();
      assert.equal(balance, 10000);

      await this.tokenBatch.batchTransfer([recipient, anotherAccount, thirdAccount], [1000, 1000, 1000]);

      const balance1 = await this.tokenBatch.balanceOfToken();
      assert.equal(balance1, 7000);
      const balance2 = await this.token.balanceOf(recipient);
      assert.equal(balance2, 1000);
      const balance3 = await this.token.balanceOf(anotherAccount);
      assert.equal(balance3, 1000);
      const balance4 = await this.token.balanceOf(thirdAccount);
      assert.equal(balance4, 1000);
    });

    describe('When the batchTransfer transfer more then it has', function () {
      it('reverts', async function () {
        await assertRevert(this.tokenBatch.batchTransfer(
          [recipient, anotherAccount, thirdAccount],
          [5000, 5000, 1000]
        ));
      });
    });

    describe('When the TokenBatchTransfer has no tokens', function () {
      it('reverts', async function () {
        await assertRevert(this.tokenBatch.batchTransfer(
          [recipient, anotherAccount, thirdAccount],
          [1000, 1000, 1000]
        ));
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 100, { from: owner });
        await assertRevert(this.tokenBatch.batchTransfer([to], [10]));
      });
    });

    describe('When the sender is not owner', function () {
      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 10000, { from: owner });
        await assertRevert(this.tokenBatch.batchTransfer([recipient], [10], { from: anotherAccount }));
      });
    });

    describe('When the contract has enough token.', function () {
      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 10000, { from: owner });
        await assertRevert(this.tokenBatch.batchTransfer([recipient], [10100]));
      });
    });

    describe('When the contract batchTransfer param no address.', function () {
      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 10000, { from: owner });
        await assertRevert(this.tokenBatch.batchTransfer([], [10100]));
      });
    });

    describe('When the contract batchTransfer param diff lenth.', function () {
      it('reverts', async function () {
        await this.token.transfer(this.tokenBatch.address, 10000, { from: owner });
        await assertRevert(this.tokenBatch.batchTransfer([recipient], [10100, 10000]));
      });
    });
  });
});
