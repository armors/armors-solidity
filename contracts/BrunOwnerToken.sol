pragma solidity ^0.4.23;

import "./StandardToken.sol";
import "./Ownable.sol";


contract BrunOwnerToken is StandardToken, Ownable {

  // events
  event Burn(address indexed burner, uint256 value);

  function burnOwner(uint256 _value) public onlyOwner returns(bool) {
    require(_value <= _balances[msg.sender]);

    _balances[msg.sender] = _balances[msg.sender].sub(_value);
    _totalSupply = _totalSupply.sub(_value);

    emit Burn(msg.sender, _value);
    emit Transfer(msg.sender, address(0), _value);

    return true;
  }
}
