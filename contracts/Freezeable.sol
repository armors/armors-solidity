pragma solidity ^0.4.18;

contract Freezeable {
    // public variables

    // internal variables
    mapping(address => bool) _freezeList;

    // events
    event Freezed(address indexed freezedAddr);
    event UnFreezed(address indexed unfreezedAddr);


    // public functions
    function freeze(address addr) public returns (bool) {
      require(true != _freezeList[addr]);

      _freezeList[addr] = true;

      Freezed(addr);
      return true;
    }

    function unfreeze(address addr) public returns (bool) {
      require(true == _freezeList[addr]);

      _freezeList[addr] = false;

      UnFreezed(addr);
      return true;
    }

    modifier whenNotFreezed() {
        require(true != _freezeList[msg.sender]);
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
