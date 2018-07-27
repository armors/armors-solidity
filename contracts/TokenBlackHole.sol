pragma solidity ^0.4.23;


contract TokenBlackHole {
  function info() public view returns (string) {
    return "The purpose of this contract is to provide the function of burnning token indirectly for those ERC20 contracts that have been published and lack of burn function. Transfer to the address of this contract will not be able to be withdrawn.";
  }
}
