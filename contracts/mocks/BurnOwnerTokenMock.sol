pragma solidity ^0.4.23;

import "../BurnOwnerToken.sol";


contract BurnOwnerTokenMock is BurnOwnerToken {

  constructor(address initialAccount, uint256 initialBalance) public {
    _balances[initialAccount] = initialBalance;
    _totalSupply = initialBalance;
  }

}
