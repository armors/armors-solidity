
import assertRevert from './helpers/assertRevert';
import { inLogs } from './helpers/expectEvent';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const BrunOwnerToken = artifacts.require('BurnOwnerTokenMock');

contract('BrunOwnerToken', function ([owner, anotherAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  beforeEach(async function () {
    this.token = await BrunOwnerToken.new(owner, 1000);
  });

  describe('as a basic burnable token', function () {
    describe('when the given amount is not greater than balance of the sender', function () {
      const amount = 100;

      it('burns the requested amount', async function () {
        const totalSupply = await this.token.totalSupply();

        await this.token.burnOwner(amount);
        const balance = await this.token.balanceOf(owner);

        assert.equal(balance, (totalSupply - amount));
      });

      it('emits a burn event', async function () {
        ({ logs: this.logs } = await this.token.burnOwner(amount));

        const event = await inLogs(this.logs, 'Burn');
        event.args.burner.should.eq(owner);
        event.args.value.should.be.bignumber.equal(amount);
      });

      it('emits a transfer event', async function () {
        ({ logs: this.logs } = await this.token.burnOwner(amount));

        const event = await inLogs(this.logs, 'Transfer');
        event.args.from.should.eq(owner);
        event.args.to.should.eq(ZERO_ADDRESS);
        event.args.value.should.be.bignumber.equal(amount);
      });
    });

    describe('when the given amount is greater than the balance of the sender', function () {
      it('reverts', async function () {
        const greaterSender = 1001;
        await assertRevert(this.token.burnOwner(greaterSender));
      });
    });
  });
});
