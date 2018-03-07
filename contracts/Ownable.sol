pragma solidity ^0.4.18;

contract Ownable {

    // public variables
    address public owner;

    // internal variables

    // events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // public functions
    function Ownable() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    // internal functions
}
