pragma solidity ^0.4.23;

import "../FreezeableToken.sol";


contract FreezeableTokenMock is FreezeableToken {

  constructor(address initialAccount, uint256 initialBalance) public {
    _balances[initialAccount] = initialBalance;
    _totalSupply = initialBalance;
  }

}
