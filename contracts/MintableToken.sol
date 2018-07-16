pragma solidity ^0.4.23;

import "./StandardToken.sol";
import "./Ownable.sol";


contract MintableToken is StandardToken, Ownable {
  // public variables
  bool public mintingFinished = false;

  // internal variables

  // events
  event Mint(address indexed to, uint256 value);
  event MintFinished();

  // public functions

  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  function mint(address addr, uint256 value) public onlyOwner canMint returns (bool) {
    _totalSupply = _totalSupply.add(value);
    _balances[addr] = _balances[addr].add(value);

    emit Mint(addr, value);
    emit Transfer(address(0), addr, value);

    return true;
  }

  function finishMinting() public onlyOwner canMint returns (bool) {
    mintingFinished = true;
    emit MintFinished();
    return true;
  }

  // internal functions
}
