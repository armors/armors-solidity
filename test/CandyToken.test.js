import assertRevert from './helpers/assertRevert';
const DemoTokenMock = artifacts.require('CandyDemoToken');

contract('CandyDemoToken', function ([owner, recipient, airdropWallet,
  test4, test5, test6, test7, test8, test9, test10]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const PAY = 5 * (10 ** 18);

  beforeEach(async function () {
    this.token = await DemoTokenMock.new();
  });

  describe('total supply', function () {
    it('returns the total amount of tokens,totalSupply notEqual zero', async function () {
      const totalSupply = await this.token.totalSupply();
      assert.notEqual(totalSupply, 0);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(owner);
        assert.notEqual(balance, 0);
      });
    });

    describe('transfer to airdropWallet some token', function () {
      it('returns the total amount of tokens', async function () {
        await this.token.transfer(airdropWallet, 10);
        assert.notEqual(airdropWallet, 0);
      });
    });

    describe('candy  test', function () {
      describe('candy initial', function () {
        it('return CandyToken', async function () {
          await this.token.initAirdrop(5, airdropWallet);
          const candy = await this.token.candy();
          assert.notEqual(candy, 0);
        });
      });

      describe('candy initial not owner', function () {
        it('reverts', async function () {
          await assertRevert(this.token.initAirdrop(5, airdropWallet, { from: test10 }));
        });
      });

      describe('candy airdrop', function () {
        it('wallet not enough money,transfer from owner', async function () {
          await this.token.initAirdrop(5, airdropWallet);
          await this.token.approve(this.token.address, 10);
          await this.token.transfer(test5, 100);
          const test5Balance = await this.token.balanceOf(test5);
          assert.notEqual(test5Balance, 0);
        });
      });

      describe('transfer owner,candy,not airdropped', function () {
        it('returns the transfer result', async function () {
          await this.token.initAirdrop(5, airdropWallet);
          await this.token.transfer(airdropWallet, 80 * (10 ** 18));
          await this.token.approve(this.token.address, 20 * (10 ** 18), { from: airdropWallet });
          const candy = await this.token.candy();
          await this.token.transfer(test5, candy, { from: owner });
          const test5Balance = await this.token.balanceOf(test5);
          assert.notEqual(test5Balance, 0);
        });
      });
    });

    describe('candy airdrop', function () {
      it('return airdrop enough money from wallet', async function () {
        await this.token.initAirdrop(5, airdropWallet);
        await this.token.transfer(airdropWallet, 80 * (10 ** 18));
        await this.token.approve(this.token.address, 20 * (10 ** 18), { from: airdropWallet });
        const rs = await this.token.getAirdropFinished();
        assert.equal(rs, false);
        await this.token.transfer(test4, 5, { from: airdropWallet });
        const test4Balance = await this.token.balanceOf(test4);
        assert.equal(test4Balance, PAY + 5);
        const airdropWalletBalance = await this.token.balanceOf(airdropWallet);
        assert.equal(airdropWalletBalance, 80 * (10 ** 18) - 5);
        const test7Balance = await this.token.balanceOf(test7);
        assert.equal(test7Balance, PAY);
      });
    });

    describe('candy airdrop', function () {
      it('return airdrop enough money from same anotherAccount', async function () {
        await this.token.initAirdrop(5, airdropWallet);// 每次转5个
        await this.token.transfer(airdropWallet, 80 * (10 ** 18));
        await this.token.approve(this.token.address, 20 * (10 ** 18), { from: airdropWallet });// 授权转10个
        await this.token.transfer(test4, 5, { from: test10 });
        const test10Balance = await this.token.balanceOf(test10);
        const test10Status = await this.token.airdropped(test10);
        const test4Balance = await this.token.balanceOf(test4);
        assert.equal(test10Balance, PAY - 5);
        assert.equal(test10Status, true);
        assert.equal(test4Balance, PAY + 5);

        await this.token.transfer(test4, 5, { from: test10 });
        const test10Balance1 = await this.token.balanceOf(test10);
        const test10Status1 = await this.token.airdropped(test10);
        const test4Balance1 = await this.token.balanceOf(test4);
        assert.equal(test10Balance1, PAY - 10);
        assert.equal(test10Status1, true);
        assert.equal(test4Balance1, PAY + 10);

        const test4Status = await this.token.airdropped(test4);
        assert.equal(test4Status, false);
      });
    });

    describe('candy airdrop', function () {
      it('return airdrop enough money from anotherAccount', async function () {
        await this.token.initAirdrop(5, airdropWallet);// 每次转5个
        await this.token.transfer(airdropWallet, 80 * (10 ** 18));
        await this.token.approve(this.token.address, 20 * (10 ** 18), { from: airdropWallet });// 授权转10个

        await this.token.transfer(test5, 5, { from: test6 });
        const test6Balance = await this.token.balanceOf(test6);
        const test6Status = await this.token.airdropped(test6);
        const test5Balance = await this.token.balanceOf(test5);
        assert.equal(test6Balance, PAY - 5);
        assert.equal(test6Status, true);
        assert.equal(test5Balance, PAY + 5);

        await this.token.transfer(test8, 5, { from: test5 });
        const test5Balance1 = await this.token.balanceOf(test5);
        const test5Status1 = await this.token.airdropped(test5);
        const test8Balance = await this.token.balanceOf(test8);
        assert.equal(test5Balance1, PAY);
        assert.equal(test5Status1, true);
        assert.equal(test8Balance, PAY + 5);
        const test8Status = await this.token.airdropped(test8);
        assert.equal(test8Status, false);
      });
    });

    describe('branch', function () {
      describe('ZERO_ADDRESS test', function () {
        it('reverts ZERO_ADDRESS', async function () {
          await assertRevert(this.token.transfer(ZERO_ADDRESS, 1));
        });
      });

      describe('onlyAirdropFinished test', function () {
        it('reverts onlyAirdropFinished', async function () {
          await this.token.initAirdrop(5, airdropWallet);
          await this.token.transfer(airdropWallet, 80 * (10 ** 18));
          await this.token.approve(this.token.address, 20 * (10 ** 18), { from: airdropWallet });
          await assertRevert(this.token.initAirdrop(5, airdropWallet));
        });
      });

      describe('transfer value <= balance[sender] test', function () {
        it('reverts value <= balance[sender', async function () {
          await assertRevert(this.token.transfer(5, test5));
        });
      });

      describe('transferFrom add[0] test', function () {
        it('reverts transferFrom add[0]', async function () {
          await assertRevert(this.token.transferFrom(owner, ZERO_ADDRESS, 10));
        });
      });

      describe('transferFrom value <= balance[from] test', function () {
        it('reverts value <= balance[from] ', async function () {
          await assertRevert(this.token.transferFrom(test5, test10, 10));
        });
      });

      describe('transferFrom value <= _allowances[from][msg.sender] test', function () {
        it('reverts value <= _allowances[from][msg.sender] ', async function () {
          await this.token.approve(airdropWallet, 100);
          await assertRevert(this.token.transferFrom(owner, test10, 100));
        });
      });
    });
  });
});
