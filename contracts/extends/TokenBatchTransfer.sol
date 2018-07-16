pragma solidity ^0.4.23;

import "../libs/SafeMath.sol";
import "../ERC20.sol";
import "../SafeERC20.sol";
import "../Ownable.sol";


contract TokenBatchTransfer is Ownable {
  using SafeERC20 for ERC20Basic;
  using SafeMath for uint256;

  // public variables
  ERC20Basic public token;
  // events
  // public functions
  constructor (ERC20Basic tokenAddr) public {
    token = ERC20Basic(tokenAddr);
  }

  function changeToken(ERC20Basic tokenAddr) public onlyOwner {
    token = ERC20Basic(tokenAddr);
  }

  function balanceOfToken() public view returns (uint256 amount) {
    return token.balanceOf(address(this));
  }

  function safeTransfer(address funder, uint256 amount) public onlyOwner {
    token.safeTransfer(funder, amount);
  }

  function batchTransfer(address[] funders, uint256[] amounts) public onlyOwner {
    require(funders.length > 0 && funders.length == amounts.length);

    uint256 total = token.balanceOf(this);
    require(total > 0);

    uint256 fundersTotal = 0;
    for (uint i = 0; i < amounts.length; i++) {
      fundersTotal = fundersTotal.add(amounts[i]);
    }
    require(total >= fundersTotal);

    for (uint j = 0; j < funders.length; j++) {
      token.safeTransfer(funders[j], amounts[j]);
    }
  }
}
