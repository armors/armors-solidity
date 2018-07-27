pragma solidity ^0.4.23;

import "./StandardToken.sol";
import "./Ownable.sol";


contract BurnOwnerToken is StandardToken, Ownable {

  // events
  event Burn(address indexed burner, uint256 value);

  function burnOwner(uint256 value) public onlyOwner returns(bool) {
    require(value <= _balances[msg.sender]);

    _balances[msg.sender] = _balances[msg.sender].sub(value);
    _totalSupply = _totalSupply.sub(value);

    emit Burn(msg.sender, value);
    emit Transfer(msg.sender, address(0), value);

    return true;
  }
}
