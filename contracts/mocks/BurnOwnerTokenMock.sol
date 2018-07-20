pragma solidity ^0.4.23;

import "../BrunOwnerToken.sol";


contract BurnOwnerTokenMock is BrunOwnerToken {

  constructor(address initialAccount, uint256 initialBalance) public {
    _balances[initialAccount] = initialBalance;
    _totalSupply = initialBalance;
  }

}
