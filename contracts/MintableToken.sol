pragma solidity ^0.4.18;
import "./StandardToken.sol";
import "./Ownable.sol";

contract MintableToken is StandardToken, Ownable {
    // public variables

    // internal variables

    // events
    event Mint(address indexed to, uint256 value);

    // public functions
    function mint(address addr, uint256 value) onlyOwner public returns (bool) {
      _totalSupply = _totalSupply.add(value);
      _balances[addr] = _balances[addr].add(value);

      Mint(addr, value);
      Transfer(address(0), addr, value);

      return true;
    }

    // internal functions
}
