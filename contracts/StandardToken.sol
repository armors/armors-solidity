pragma solidity ^0.4.18;
import "./BasicToken.sol";
import "./libs/Math.sol";

contract StandardToken is BasicToken {
    using Math for uint256;

    // public variables

    // internal variables
    mapping (address => mapping (address => uint256)) _allowances;

    // events
    event Approval(address indexed owner, address indexed agent, uint256 value);

    // public functions
    function transferFrom(address from, address to, uint256 value) public returns (bool) {

      require(value <= _allowances[from][msg.sender]);

      _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(value);

      _transfer(from, to, value);
      return true;
    }

    function approve(address agent, uint256 value) public returns (bool) {
      _allowances[msg.sender][agent] = value;
      Approval(msg.sender, agent, value);
      return true;
    }

    function allowance(address owner, address agent) public view returns (uint256) {
      return _allowances[owner][agent];
    }

    function increaseApproval(address agent, uint value) public returns (bool) {
      _allowances[msg.sender][agent] = _allowances[msg.sender][agent].add(value);
      Approval(msg.sender, agent, _allowances[msg.sender][agent]);
      return true;
    }

    function decreaseApproval(address agent, uint value) public returns (bool) {
      uint allowanceValue = _allowances[msg.sender][agent];
      if (value > allowanceValue) {
        _allowances[msg.sender][agent] = 0;
      } else {
        _allowances[msg.sender][agent] = allowanceValue.sub(value);
      }
      Approval(msg.sender, agent, _allowances[msg.sender][agent]);
      return true;
    }

    // internal functions
}
