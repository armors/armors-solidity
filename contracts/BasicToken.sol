pragma solidity ^0.4.18;

import "./libs/Math.sol";

contract BasicToken {
    using Math for uint256;

    // public variables
    string public name;
    string public symbol;
    uint8 public decimals = 18;

    // internal variables
    uint256 _totalSupply;
    mapping(address => uint256) _balances;

    // events
    event Transfer(address indexed from, address indexed to, uint256 value);

    // public functions
    function totalSupply() public view returns (uint256) {
      return _totalSupply;
    }

    function balanceOf(address addr) public view returns (uint256 balance) {
      return _balances[addr];
    }

    function transfer(address to, uint256 value) public returns (bool) {
        return _transfer(msg.sender, to, value);
    }

    // internal functions
    function _transfer(address from, address to, uint256 value) internal returns (bool) {
      require(to != address(0));
      require(value <= _balances[from]);

      uint256 total = _balances[from] + _balances[to];

      _balances[from] = _balances[from].sub(value);
      _balances[to] = _balances[to].add(value);
      Transfer(msg.sender, to, value);

      assert(_balances[from] + _balances[to] == total);
      return true;
    }

}
