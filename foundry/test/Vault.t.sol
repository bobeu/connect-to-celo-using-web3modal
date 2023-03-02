// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/reward/RewardToken.sol";
import "../src/interfaces/IVault.sol";
import "../src/reward/IERC20.sol";

contract AnonymousStaker is Test {
  Vault public vaultContract;
  RewardToken public token;
  uint stakeAmt = 1e20 wei;

  constructor(Vault _vault, RewardToken _token) {
    if(address(_vault) == address(0)) revert("Vault is zero address");
    vaultContract = _vault;
    token = _token;
  }

  function confirmStake(uint depositTime) public {
    IVault.Staker memory stk = vaultContract.getStakeProfile();
    assertEq(stk.depositTime, depositTime);
    assertEq(stk.celoAmount, stakeAmt);
    if(stk.account == address(0)) revert ("Zero address");
    assertEq(token.balanceOf(stk.account), 0);
  }
  
  function unstake() public {
    require(vaultContract.unstake(), "Failed");
    IVault.Staker memory stk = vaultContract.getStakeProfile();
    require(stk.account != address(0), "Zero alc");
    require(token.balanceOf(stk.account) == 1e15, "Zero token reward");
    assertEq(stk.celoAmount, 0);

  }
}

contract VaultTest is Test {
  Vault public vault;
  RewardToken public token;
  AnonymousStaker public anstk;
  uint stakeAmt = 1e20 wei;

  function setUp() public {
    uint minimumStaking = 1e19 wei;
    uint maxSupply = 1_000_000_000 * (10**18);
    vault = new Vault(minimumStaking);
    token = new RewardToken(address(vault), maxSupply);
    vault.setToken(IERC20(token));
    anstk = new AnonymousStaker(vault, token);
  }
  
  receive() external payable {}

  function testStake() public {
    uint depositTime = block.timestamp;
    (bool doneStaking) = vault.stake{value: stakeAmt}();
    assertEq(doneStaking, true);

    IVault.Staker memory stk = vault.getStakeProfile();
    assertEq(stk.depositTime, depositTime);
    assertEq(stk.celoAmount, stakeAmt);
    if(stk.account == address(0)) revert ("Zero address");
    assertEq(token.balanceOf(stk.account), 0);
  }

  function testStakeOnBehalf() public {
    uint depositTime = block.timestamp;
    (bool doneStaking) = vault.stakeOnBehalf{value: stakeAmt}(address(anstk));
    assertEq(doneStaking, true);
    anstk.confirmStake(depositTime);
  }

  function testUnstake() public {
    uint initbal = address(this).balance;
    require(vault.stake{value: stakeAmt}(), "Staking failed");
    assertEq(address(this).balance, initbal - stakeAmt);
    require(vault.unstake(), "Failed");
    IVault.Staker memory stk = vault.getStakeProfile();
    require(stk.account != address(0), "Zero alc");
    require(token.balanceOf(stk.account) == 1e15, "Zero token reward");
    assertEq(stk.celoAmount, 0);
  }

  function testUnstakeByAnonymous() public {
    require(vault.stakeOnBehalf{value: stakeAmt}(address(anstk)), "Staking failed");
    anstk.unstake();
  }

  function testWithdrawal() public {
    uint initBalance = address(this).balance;
    require(vault.stake{value: stakeAmt}(), "Staking failed");
    require(address(this).balance < initBalance, "Error");
    require(vault.unstake(), "Failed");
    vault.withdraw();
    assertEq(address(this).balance, initBalance);
    require(token.balanceOf(address(this)) > 0, "Zero token reward");
  }
}