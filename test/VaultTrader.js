const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers");

describe("VaultTrader", function () {
  let VaultTrader;
  let vaultTrader;
  let owner;
  let addr1;
  let tokenA;
  let tokenB;
  let uniswapV2Router;
  let uniswapV3Router;
  let weth;

  beforeEach(async function () {
    VaultTrader = await ethers.getContractFactory("VaultTrader");
    [owner, addr1] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const WETHMock = await ethers.getContractFactory("WETHMock");
    tokenA = await ERC20Mock.deploy("Token A", "TKA", 18, parseEther("1000"));
    tokenB = await ERC20Mock.deploy("Token B", "TKB", 18, parseEther("1000"));
    weth = await WETHMock.deploy();

    const UniswapV2RouterMock = await ethers.getContractFactory(
      "UniswapV2RouterMock"
    );
    const UniswapV3RouterMock = await ethers.getContractFactory(
      "UniswapV3RouterMock"
    );

    uniswapV2Router = await UniswapV2RouterMock.deploy();
    uniswapV3Router = await UniswapV3RouterMock.deploy();

    vaultTrader = await VaultTrader.deploy(
      uniswapV2Router.target,
      uniswapV3Router.target,
      weth.target
    );
  });

  it("should successfully complete swapV2ExactIn swapV2ExactIn", async function () {
    const amountIn = parseEther("10");
    const amountOutMin = parseEther("9");

    await tokenA.transfer(owner.address, amountIn);
    await tokenA.connect(owner).approve(vaultTrader.target, amountIn);

    await expect(
      vaultTrader
        .connect(owner)
        .swapV2ExactIn(tokenA.target, tokenB.target, amountIn, amountOutMin)
    )
      .to.emit(uniswapV2Router, "Swap")
      .withArgs(tokenA.target, tokenB.target, amountIn, amountOutMin);
  });

  it("should successfully complete swapV3ExactIn", async function () {
    const amountIn = parseEther("10");
    const amountOutMin = parseEther("9");
    const fee = 3000;

    await tokenA.transfer(owner.address, amountIn);
    await tokenA.connect(owner).approve(vaultTrader.target, amountIn);

    await expect(
      vaultTrader
        .connect(owner)
        .swapV3ExactIn(
          tokenA.target,
          tokenB.target,
          fee,
          amountIn,
          amountOutMin
        )
    )
      .to.emit(uniswapV3Router, "Swap")
      .withArgs(tokenA.target, tokenB.target, fee, amountIn, amountOutMin);
  });

  // it("should successfully complete withdrawTokensWithUnwrapIfNecessary", async function () {
  //   const amount = parseEther("5");

  //   await weth.connect(owner).deposit({ value: amount });

  //   await weth.transfer(vaultTrader.target, amount);

  //   const vaultBalance = await weth.balanceOf(vaultTrader.address);
  //   console.log("VaultTrader WETH balance:", vaultBalance.toString());

  //   await expect(
  //     vaultTrader.withdrawTokensWithUnwrapIfNecessary(weth.target)
  //   ).to.changeEtherBalance(owner, amount);
  // });
});
