import assertRevert from './helpers/assertRevert';
const BigNumber = web3.BigNumber;
const DemoToken = artifacts.require('DemoToken');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DemoToken', function ([_, owner, recipient, anotherAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const totalValue = new BigNumber(10000000000000000000000);
  beforeEach(async function () {
    this.token = await DemoToken.new();
    await this.token.transfer(owner, 100);
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply();

      totalSupply.should.be.bignumber.equal(totalValue);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(anotherAccount);

        assert.equal(balance, 0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await this.token.balanceOf(owner);

        assert.equal(balance, 100);
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }));
        });
      });

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner });

          const senderBalance = await this.token.balanceOf(owner);
          assert.equal(senderBalance, 0);

          const recipientBalance = await this.token.balanceOf(to);
          assert.equal(recipientBalance, amount);
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Transfer');
          assert.equal(logs[0].args.from, owner);
          assert.equal(logs[0].args.to, to);
          assert(logs[0].args.value.eq(amount));
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });

  describe('approve', function () {
    describe('when the agent is not the zero address', function () {
      const agent = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(agent, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.agent, agent);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount);
          });
        });

        describe('when the agent had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(agent, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(agent, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.agent, agent);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount);
          });
        });

        describe('when the agent had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(agent, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount);
          });
        });
      });
    });

    describe('when the agent is the zero address', function () {
      const amount = 100;
      const agent = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await this.token.approve(agent, amount, { from: owner });

        const allowance = await this.token.allowance(owner, agent);
        assert.equal(allowance, amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.approve(agent, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Approval');
        assert.equal(logs[0].args.owner, owner);
        assert.equal(logs[0].args.agent, agent);
        assert(logs[0].args.value.eq(amount));
      });
    });
  });

  describe('transfer from', function () {
    const agent = recipient;

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount;

      describe('when the agent has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(agent, 100, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('transfers the requested amount', async function () {
            await this.token.transferFrom(owner, to, amount, { from: agent });

            const senderBalance = await this.token.balanceOf(owner);
            assert.equal(senderBalance, 0);

            const recipientBalance = await this.token.balanceOf(to);
            assert.equal(recipientBalance, amount);
          });

          it('decreases the agent allowance', async function () {
            await this.token.transferFrom(owner, to, amount, { from: agent });

            const allowance = await this.token.allowance(owner, agent);
            assert(allowance.eq(0));
          });

          it('emits a transfer event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: agent });

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'Transfer');
            assert.equal(logs[0].args.from, owner);
            assert.equal(logs[0].args.to, to);
            assert(logs[0].args.value.eq(amount));
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: agent }));
          });
        });
      });

      describe('when the agent does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(agent, 99, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: agent }));
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: agent }));
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const amount = 100;
      const to = ZERO_ADDRESS;

      beforeEach(async function () {
        await this.token.approve(agent, amount, { from: owner });
      });

      it('reverts', async function () {
        await assertRevert(this.token.transferFrom(owner, to, amount, { from: agent }));
      });
    });
  });

  describe('decrease approval', function () {
    describe('when the agent is not the zero address', function () {
      const agent = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(agent, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.agent, agent);
          assert(logs[0].args.value.eq(0));
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, 0);
          });
        });

        describe('when the agent had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(agent, amount + 1, { from: owner });
          });

          it('decreases the agent allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, 1);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(agent, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.agent, agent);
          assert(logs[0].args.value.eq(0));
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, 0);
          });
        });

        describe('when the agent had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(agent, amount + 1, { from: owner });
          });

          it('decreases the agent allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, 1);
          });
        });
      });
    });

    describe('when the agent is the zero address', function () {
      const amount = 100;
      const agent = ZERO_ADDRESS;

      it('decreases the requested amount', async function () {
        await this.token.decreaseApproval(agent, amount, { from: owner });

        const allowance = await this.token.allowance(owner, agent);
        assert.equal(allowance, 0);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.decreaseApproval(agent, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Approval');
        assert.equal(logs[0].args.owner, owner);
        assert.equal(logs[0].args.agent, agent);
        assert(logs[0].args.value.eq(0));
      });
    });
  });

  describe('increase approval', function () {
    const amount = 100;

    describe('when the agent is not the zero address', function () {
      const agent = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(agent, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.agent, agent);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount);
          });
        });

        describe('when the agent had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(agent, 1, { from: owner });
          });

          it('increases the agent allowance adding the requested amount', async function () {
            await this.token.increaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount + 1);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(agent, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.agent, agent);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount);
          });
        });

        describe('when the agent had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(agent, 1, { from: owner });
          });

          it('increases the agent allowance adding the requested amount', async function () {
            await this.token.increaseApproval(agent, amount, { from: owner });

            const allowance = await this.token.allowance(owner, agent);
            assert.equal(allowance, amount + 1);
          });
        });
      });
    });

    describe('when the agent is the zero address', function () {
      const agent = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await this.token.increaseApproval(agent, amount, { from: owner });

        const allowance = await this.token.allowance(owner, agent);
        assert.equal(allowance, amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.increaseApproval(agent, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Approval');
        assert.equal(logs[0].args.owner, owner);
        assert.equal(logs[0].args.agent, agent);
        assert(logs[0].args.value.eq(amount));
      });
    });
  });
});
