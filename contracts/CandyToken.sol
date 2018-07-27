pragma solidity ^0.4.23;

import "./StandardToken.sol";
import "./Ownable.sol";


contract CandyToken is StandardToken, Ownable {
  // events
  event Airdrop(address indexed beneficiary, uint256 value);

  // public variables
  uint256 public candy = 0;

  address public airdropWallet;

  bool airdropFinished;

  // internal variables
  mapping (address => bool) _beneficiaries;

  // public functions
  modifier onlyAirdropFinished() {
    require(_allowances[airdropWallet][this] == 0);
    _;
  }

  function getAirdropFinished() public view returns (bool) {
    return _allowances[airdropWallet][this] == 0;
  }

  function initAirdrop(uint256 newCandyAmount, address newAirdropWallet) public onlyOwner onlyAirdropFinished {
    candy = newCandyAmount * (10 ** uint256(decimals));
    airdropWallet = newAirdropWallet;
  }

  function balanceOf(address addr) public view returns (uint256 balance) {
    if (_allowances[airdropWallet][this] == 0 || addr == airdropWallet || addr == owner) {
      return _balances[addr];
    } else {
      if (_beneficiaries[addr] == true) {
        return _balances[addr];
      } else {
        return _balances[addr].add(candy);
      }
    }
  }

  function transfer(address to, uint256 value) public returns (bool) {
    require(isContract(to) == false);
    require(to != address(0));

    // solium-disable-next-line operator-whitespace
    if ((_allowances[airdropWallet][this] != 0) &&
      (_allowances[airdropWallet][this] <= _balances[airdropWallet]) &&
      (to != airdropWallet) &&
      (to != owner)) {
      if (msg.sender == owner && value == candy && _beneficiaries[to] != true) {
        emit Transfer(msg.sender, to, value);
        return true;
      } else {
        airdrop(msg.sender);
      }
    }

    require(value <= _balances[msg.sender]);

    _balances[msg.sender] = _balances[msg.sender].sub(value);
    _balances[to] = _balances[to].add(value);
    emit Transfer(msg.sender, to, value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    require(isContract(to) == false);
    require(to != address(0));
    require(value <= _balances[from]);
    require(value <= _allowances[from][msg.sender]);

    _balances[from] = _balances[from].sub(value);
    _balances[to] = _balances[to].add(value);
    _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(value);
    emit Transfer(from, to, value);
    return true;
  }

  function airdropped (address beneficiary) public view returns (bool) {
    return _beneficiaries[beneficiary];
  }

  function airdrop(address beneficiary) private {
    if (_allowances[airdropWallet][this] != 0 && _beneficiaries[beneficiary] != true) {
      this.transferFrom(airdropWallet, beneficiary, candy);
      _beneficiaries[beneficiary] = true;
      emit Airdrop(beneficiary, candy);
    }
  }

  function isContract(address addr) internal view returns (bool) {
    uint size;
    // solium-disable-next-line security/no-inline-assembly
    assembly { size := extcodesize(addr) }
    return size > 0;
  }
}
