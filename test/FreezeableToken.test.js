
import assertRevert from './helpers/assertRevert';

const FreezeableToken = artifacts.require('FreezeableTokenMock');

contract('FreezeableToken', function ([_, owner, recipient, anotherAccount, approveAccount]) {
  beforeEach(async function () {
    this.token = await FreezeableToken.new(recipient, 100, { from: owner });
  });

  describe('freeze', function () {
    describe('when the sender is the token owner', function () {
      const from = owner;
      describe('when the address is unfreezed', function () {
        it('freeze the address', async function () {
          await this.token.freeze(recipient, { from });

          const freezed = await this.token.isFreezed(recipient);
          assert.equal(freezed, true);
        });

        it('emits a Freezed event', async function () {
          const { logs } = await this.token.freeze(recipient, { from });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Freezed');
        });
      });

      describe('when the address is freezed', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from });
        });

        it('reverts', async function () {
          await assertRevert(this.token.freeze(recipient, { from }));
        });
      });
    });
    describe('when the sender is not the token owner', function () {
      const from = anotherAccount;

      it('reverts', async function () {
        await assertRevert(this.token.freeze(recipient, { from }));
      });
    });
  });

  describe('unfreeze', function () {
    describe('when the sender is the token owner', function () {
      const from = owner;
      describe('when the address is freezed', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from });
        });

        it('unfreeze the address', async function () {
          await this.token.unfreeze(recipient, { from });

          const freezed = await this.token.isFreezed(recipient);
          assert.equal(freezed, false);
        });

        it('emits a UnFreezed event', async function () {
          const { logs } = await this.token.unfreeze(recipient, { from });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'UnFreezed');
        });
      });

      describe('when the address is unfreezed', function () {
        it('reverts', async function () {
          await assertRevert(this.token.unfreeze(recipient, { from }));
        });
      });
    });
    describe('when the sender is not the token owner', function () {
      const from = anotherAccount;

      it('reverts', async function () {
        await assertRevert(this.token.unfreeze(recipient, { from }));
      });
    });
  });

  describe('freezeable token', function () {
    const from = owner;

    describe('freezed', function () {
      it('is not freezed by default', async function () {
        const freezed = await this.token.isFreezed(recipient);

        assert.equal(freezed, false);
      });

      it('is freezed after being freezed', async function () {
        await this.token.freeze(recipient, { from });
        const freezed = await this.token.isFreezed(recipient);

        assert.equal(freezed, true);
      });

      it('is not freezed after being freezed and then unfreezed', async function () {
        await this.token.freeze(recipient, { from });
        await this.token.unfreeze(recipient, { from });
        const freezed = await this.token.isFreezed(recipient);

        assert.equal(freezed, false);
      });
    });

    describe('transfer', function () {
      it('allows to transfer when unfreezed', async function () {
        await this.token.transfer(anotherAccount, 100, { from: recipient });

        const senderBalance = await this.token.balanceOf(recipient);
        assert.equal(senderBalance, 0);

        const recipientBalance = await this.token.balanceOf(anotherAccount);
        assert.equal(recipientBalance, 100);
      });

      it('allows to transfer when freezed and then unfreezed', async function () {
        await this.token.freeze(recipient, { from: owner });
        await this.token.unfreeze(recipient, { from: owner });

        await this.token.transfer(anotherAccount, 100, { from: recipient });

        const senderBalance = await this.token.balanceOf(recipient);
        assert.equal(senderBalance, 0);

        const recipientBalance = await this.token.balanceOf(anotherAccount);
        assert.equal(recipientBalance, 100);
      });

      describe('when trying to transfer when freezed', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from: owner });
        });

        it('revert when is sender', async function () {
          await assertRevert(this.token.transfer(anotherAccount, 100, { from: recipient }));
        });

        it('revert when is receiver', async function () {
          await assertRevert(this.token.transfer(recipient, 0, { from: owner }));
        });
      });
    });

    describe('approve', function () {
      it('allows to approve when unfreezed', async function () {
        await this.token.approve(approveAccount, 40, { from: recipient });

        const allowance = await this.token.allowance(recipient, approveAccount);
        assert.equal(allowance, 40);
      });

      it('allows to transfer when freezed and then unfreezed', async function () {
        await this.token.freeze(recipient, { from: owner });
        await this.token.unfreeze(recipient, { from: owner });

        await this.token.approve(approveAccount, 40, { from: recipient });

        const allowance = await this.token.allowance(recipient, approveAccount);
        assert.equal(allowance, 40);
      });

      describe('when trying to approve when freezed', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from: owner });
        });

        it('revert when is owner', async function () {
          await assertRevert(this.token.approve(approveAccount, 100, { from: recipient }));
        });

        it('revert when is agent', async function () {
          await assertRevert(this.token.approve(recipient, 0, { from: owner }));
        });
      });
    });

    describe('transfer from', function () {
      beforeEach(async function () {
        await this.token.approve(approveAccount, 50, { from: recipient });
      });

      it('allows to transfer from when unfreezed', async function () {
        await this.token.transferFrom(recipient, anotherAccount, 40, { from: approveAccount });

        const senderBalance = await this.token.balanceOf(recipient);
        assert.equal(senderBalance, 60);

        const recipientBalance = await this.token.balanceOf(anotherAccount);
        assert.equal(recipientBalance, 40);
      });

      it('allows to transfer when freezed the sender and then unfreezed', async function () {
        await this.token.freeze(recipient, { from: owner });
        await this.token.unfreeze(recipient, { from: owner });

        await this.token.transferFrom(recipient, anotherAccount, 40, { from: approveAccount });

        const senderBalance = await this.token.balanceOf(recipient);
        assert.equal(senderBalance, 60);

        const recipientBalance = await this.token.balanceOf(anotherAccount);
        assert.equal(recipientBalance, 40);
      });

      it('allows to transfer when freezed the receiver and then unfreezed', async function () {
        await this.token.freeze(anotherAccount, { from: owner });
        await this.token.unfreeze(anotherAccount, { from: owner });

        await this.token.transferFrom(recipient, anotherAccount, 40, { from: approveAccount });

        const senderBalance = await this.token.balanceOf(recipient);
        assert.equal(senderBalance, 60);

        const recipientBalance = await this.token.balanceOf(anotherAccount);
        assert.equal(recipientBalance, 40);
      });

      describe('when trying to transfer from when freezed the sender', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from: owner });
        });

        it('revert', async function () {
          await assertRevert(this.token.transferFrom(recipient, anotherAccount, 40, { from: approveAccount }));
        });
      });

      describe('when trying to transfer from when freezed the receiver', function () {
        beforeEach(async function () {
          await this.token.freeze(anotherAccount, { from: owner });
        });

        it('revert', async function () {
          await assertRevert(this.token.transferFrom(recipient, anotherAccount, 40, { from: approveAccount }));
        });
      });
    });

    describe('decrease approval', function () {
      beforeEach(async function () {
        await this.token.approve(approveAccount, 100, { from: recipient });
      });

      it('allows to decrease approval when unfreezed', async function () {
        await this.token.decreaseApproval(approveAccount, 40, { from: recipient });

        const allowance = await this.token.allowance(recipient, approveAccount);
        assert.equal(allowance, 60);
      });

      it('allows to decrease approval when freezed and then unfreezed', async function () {
        await this.token.freeze(recipient, { from: owner });
        await this.token.unfreeze(recipient, { from: owner });

        await this.token.decreaseApproval(approveAccount, 40, { from: recipient });

        const allowance = await this.token.allowance(recipient, approveAccount);
        assert.equal(allowance, 60);
      });

      describe('when trying to decrease approval when freezed', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from: owner });
        });

        it('revert when is owner', async function () {
          await assertRevert(this.token.decreaseApproval(approveAccount, 40, { from: recipient }));
        });

        it('revert when is agent', async function () {
          await assertRevert(this.token.decreaseApproval(recipient, 0, { from: owner }));
        });
      });
    });

    describe('increase approval', function () {
      beforeEach(async function () {
        await this.token.approve(approveAccount, 100, { from: recipient });
      });

      it('allows to increase approval when unfreezed', async function () {
        await this.token.increaseApproval(approveAccount, 40, { from: recipient });

        const allowance = await this.token.allowance(recipient, approveAccount);
        assert.equal(allowance, 140);
      });

      it('allows to increase approval when freezed and then unfreezed', async function () {
        await this.token.freeze(recipient, { from: owner });
        await this.token.unfreeze(recipient, { from: owner });

        await this.token.increaseApproval(approveAccount, 40, { from: recipient });

        const allowance = await this.token.allowance(recipient, approveAccount);
        assert.equal(allowance, 140);
      });

      describe('when trying to increase approval when freezed', function () {
        beforeEach(async function () {
          await this.token.freeze(recipient, { from: owner });
        });

        it('revert when is owner', async function () {
          await assertRevert(this.token.increaseApproval(approveAccount, 40, { from: recipient }));
        });

        it('revert when is agent', async function () {
          await assertRevert(this.token.increaseApproval(recipient, 0, { from: owner }));
        });
      });
    });
  });
});
