pragma solidity ^0.4.18;

import "./Ownable.sol";

contract Freezeable is Ownable{
    // public variables

    // internal variables
    mapping(address => bool) _freezeList;

    // events
    event Freezed(address indexed freezedAddr);
    event UnFreezed(address indexed unfreezedAddr);


    // public functions
    function freeze(address addr) onlyOwner whenNotFreezed public returns (bool) {
      require(true != _freezeList[addr]);

      _freezeList[addr] = true;

      Freezed(addr);
      return true;
    }

    function unfreeze(address addr) onlyOwner whenFreezed public returns (bool) {
      require(true == _freezeList[addr]);

      _freezeList[addr] = false;

      UnFreezed(addr);
      return true;
    }

    modifier whenNotFreezed() {
        require(true != _freezeList[msg.sender]);
        _;
    }

    modifier whenFreezed() {
        require(true == _freezeList[msg.sender]);
        _;
    }

    function isFreezing(address addr) public view returns (bool) {
        if (true == _freezeList[addr]) {
            return true;
        } else {
            return false;
        }
    }

    // internal functions
}
