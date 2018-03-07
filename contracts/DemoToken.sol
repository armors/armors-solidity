pragma solidity ^0.4.18;
import "./StandardToken.sol";

contract DemoToken is StandardToken {
    // public variables
    string public name = "Demo Token";
    string public symbol = "DEMO";
    uint8 public decimals = 18;

    // internal variables
    uint256 _totalSupply = 10000 * (10 ** uint256(decimals));

    // events

    // public functions
    function DemoToken() public {
      _balances[msg.sender] = _totalSupply;
      Transfer(0x0, msg.sender, _totalSupply);
    }


    // internal functions
}
