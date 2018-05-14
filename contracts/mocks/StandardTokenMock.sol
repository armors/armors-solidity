pragma solidity ^0.4.23;

import "../StandardToken.sol";


contract StandardTokenMock is StandardToken {

  constructor(address initialAccount, uint256 initialBalance) public {
    _balances[initialAccount] = initialBalance;
    _totalSupply = initialBalance;
  }

}
