pragma solidity ^0.4.22;

import "../BasicToken.sol";

contract BasicTokenMock is BasicToken {

  constructor(address initialAccount, uint256 initialBalance) public {
    _balances[initialAccount] = initialBalance;
    _totalSupply = initialBalance;
  }

}
