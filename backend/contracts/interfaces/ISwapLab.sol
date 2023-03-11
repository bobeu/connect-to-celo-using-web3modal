// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISwapLab {
  struct Pair {
    uint rateInAssetBOrA;
    address pair;
    address owner;
  }

  function swapERC20ToERC20(IERC20 assetA) external payable returns(bool);
  function swapERC20ForCelo(address asset) external payable returns(bool); 

}