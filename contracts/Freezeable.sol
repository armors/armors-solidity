pragma solidity ^0.4.23;

import "./Ownable.sol";


contract Freezeable is Ownable {
  // public variables

  // internal variables
  mapping(address => bool) _freezeList;

  // events
  event Freezed(address indexed freezedAddr);
  event UnFreezed(address indexed unfreezedAddr);

  // public functions
  function freeze(address addr) public onlyOwner returns (bool) {
    require(true != _freezeList[addr]);

    _freezeList[addr] = true;

    emit Freezed(addr);
    return true;
  }

  function unfreeze(address addr) public onlyOwner returns (bool) {
    require(true == _freezeList[addr]);

    _freezeList[addr] = false;

    emit UnFreezed(addr);
    return true;
  }

  modifier whenNotFreezed() {
    require(true != _freezeList[msg.sender]);
    _;
  }

  function isFreezed(address addr) public view returns (bool) {
    if (true == _freezeList[addr]) {
      return true;
    } else {
      return false;
    }
  }
  // internal functions
}
