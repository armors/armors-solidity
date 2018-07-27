pragma solidity ^0.4.23;

import "../CandyToken.sol";


contract CandyTokenMock is CandyToken {
  // public variables
  string public name = "Demo Token";
  string public symbol = "DEMO";
  uint8 public decimals = 18;

  // public functions
  constructor() public {
    _totalSupply = 10000 * (10 ** uint256(decimals));

    _balances[msg.sender] = _totalSupply;
    emit Transfer(0x0, msg.sender, _totalSupply);
  }
}
