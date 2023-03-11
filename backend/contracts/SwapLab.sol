// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ISwapLab.sol";

/**@title Swap ERC20 for $CELO & ERC20 for ERC20
 * Anyone can be become a Celo or cUSD provider
 */
contract SwapLab is ISwapLab, Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using Address for address;

  error UnSupportedAsset(address);
  error AssetIsSupported(address);
  error InsufficientLiquidyInContract(uint balThis, uint balToRec);
  error ContractAddressNotAllowed(address);

  uint public totalLiquidity;
  uint public totalFeeReceived;
  uint public totalProvider;
  uint public swapfee;

  address public feeTo;

  struct SupportedAsset {
    bool isSupported;
    uint rate;
  }

  struct Provider {
    uint amount;
    uint timeProvided;
    uint position;
    bool isExist;
  }

  address[] public providersAddress;

  mapping(address => SupportedAsset) public supportedAssets;

  mapping (address => Pair) public pairs;
  
  mapping(address => Provider) public liqProviders;

  modifier onlyEOA() {
    if(Address.isContract(msg.sender)) revert ContractAddressNotAllowed(msg.sender);
    _;
  }

  modifier isProvider() {
    require(liqProviders[msg.sender].amount > 0, "Not a provider");
    _;
  }

  modifier isSupportedAsset(address asset, bool switchFunc) {
    SupportedAsset memory sat = supportedAssets[asset];
    if(!sat.isSupported) revert UnSupportedAsset(asset);
    if(switchFunc) {
      Pair memory pr = pairs[asset];
      require(pr.pair != address(0), "No pair found");
    }
    _;
  }

  constructor(address _supportedAsset1, address _supportedAsset2) {
    address[] memory sAsset = new address[](2);
    uint[] memory rates = new uint[](2);
    uint[] memory rateInAssetBOrA = new uint[](2);
    rateInAssetBOrA[0] = 1 * (10**17);
    rateInAssetBOrA[1] = 1 * (10**17);
    sAsset[0] = _supportedAsset1;
    sAsset[1] = _supportedAsset2;
    rates[0] = 50 * (10 ** 18);
    swapfee = 1e14 wei;
    feeTo = _msgSender();
    providersAddress.push(msg.sender);

    _setSupportedAsset(
      sAsset, 
      rates
    );
    _setPair(sAsset, rateInAssetBOrA, _msgSender());

  }

  function _setSupportedAsset(
    address[] memory _supportedAssets, 
    uint[] memory rates
  ) private {
    require(
      _supportedAssets.length == rates.length, 
      "Length mismatch");
    for (uint i = 0; i < _supportedAssets.length; i++) {
      supportedAssets[_supportedAssets[i]] = SupportedAsset(
        true,
        rates[i]
      );
    }
  }

  function setSupportedAsset(    
    address[] memory _supportedAssets, 
    uint[] memory rates
  ) public onlyOwner {
    _setSupportedAsset(_supportedAssets, rates);
  }

  function _setPair(address[] memory assets, uint[] memory rateInAssetBOrA, address tokenOwner) internal {
    require(assets.length == 2 && rateInAssetBOrA.length == assets.length, "Invalid data");
    require(Address.isContract(assets[0]) && Address.isContract(assets[1]), "Address not a contract");
    require(assets[0] != address(0) && assets[1] != address(0), "Zero address spotted");
    _setSupportedAsset(assets, rateInAssetBOrA);
    pairs[assets[0]] = Pair(rateInAssetBOrA[0], assets[1], tokenOwner);
    pairs[assets[1]] = Pair(rateInAssetBOrA[0], assets[0], tokenOwner);
  }

  function setPair(address[] memory assets, uint[] memory rateInAssetBOrA, address tokenOwner) public onlyOwner {
    _setPair(assets, rateInAssetBOrA, tokenOwner);
  }

  function swapERC20ToERC20(IERC20 assetA) external payable nonReentrant isSupportedAsset(address(assetA), true) returns(bool) {
    uint fee = swapfee;
    require(msg.value > fee, "Insufficient value");
    uint deposit = IERC20(assetA).allowance(_msgSender(), address(this));
    uint assetAmantissa = 10 ** IERC20Metadata(address(assetA)).decimals();
    Pair memory pr = pairs[address(assetA)];
    require(deposit > 0, "No deposit");
    uint amtToSwapInAssetB = deposit.mul(pr.rateInAssetBOrA).div(assetAmantissa);
    require(IERC20(pr.pair).allowance(pr.owner, address(this)) >= amtToSwapInAssetB, "Not enough allowance");
    Address.sendValue(payable(feeTo), fee);
    bool sent = IERC20(pr.pair).transferFrom(pr.owner, _msgSender(), amtToSwapInAssetB);
    bool sent1 = IERC20(assetA).transferFrom(_msgSender(), pr.owner, deposit);
    require(sent && sent1, "Failed");

    return true;
  }

  function swapERC20ForCelo(address asset) external payable onlyEOA nonReentrant isSupportedAsset(asset, false) returns(bool) {
    // SupportedAsset memory sat = supportedAssets[asset];
    uint mantissa = 10 ** 18;
    uint amountToSwap = IERC20(asset).allowance(msg.sender, address(this));
    require(amountToSwap > mantissa && amountToSwap.div(mantissa).mod(100) == 0, "Invalid token request");
    uint fee = swapfee;
    require(msg.value >= fee, "Insufficient value to pay swap fee");
    uint valInCelo = amountToSwap.div(mantissa).mul(1e9 wei);
    if(valInCelo > totalLiquidity) revert InsufficientLiquidyInContract(totalLiquidity, valInCelo);
    totalFeeReceived = totalFeeReceived.add(fee);
    totalLiquidity = totalLiquidity.sub(valInCelo);
    require(IERC20(asset).transferFrom(msg.sender, owner(), amountToSwap), "Failed");
    Address.sendValue(payable(feeTo), fee);
    Address.sendValue(payable(msg.sender), valInCelo);

    return true;
  }

  /**@dev
   * We try to be fair with those that have previous liquidity in the pool
   * by backdating the time liquidity was provided.
   */
  function addLiquidity() public payable onlyEOA {
    require(msg.value > 0,"Insufficient value");
    Provider memory prov = liqProviders[msg.sender];
    uint position = prov.position;
    if(prov.isExist == false) {
      position = providersAddress.length;
      totalProvider ++;
      providersAddress.push(msg.sender);
    } else {
      if(providersAddress[position] == address(0)) {
        providersAddress[position] = msg.sender;
      }
    }
    liqProviders[msg.sender] = Provider(
      prov.amount.add(msg.value),
      prov.timeProvided > 0 ? _now().sub(prov.timeProvided).div(2).add(prov.timeProvided) : _now(),
      position,
      true
    );

    totalLiquidity = totalLiquidity.add(msg.value);
  }

  /**@dev 
   * If provider has no liquidity balance left in the pool, their
   * provided time is reset.
   */
  function removeLiquidity() public onlyEOA isProvider nonReentrant {
    Provider memory prov = liqProviders[msg.sender];
    liqProviders[msg.sender] = Provider(
      0, 
      0,
      prov.position,
      prov.isExist
    );
    totalProvider --;
    totalLiquidity = totalLiquidity.sub(prov.amount); 
    uint amtToRec = prov.amount;
    providersAddress[prov.position] = address(0);
    if(address(this).balance < prov.amount) amtToRec = address(this).balance;
    Address.sendValue(payable(msg.sender), amtToRec);
  }

  function _now() internal view returns(uint) {
    return block.timestamp;
  }

  /**@dev 
   * Anyone can call this function to split fee among the providers.
   */
  function splitFee() public onlyEOA isProvider nonReentrant {
    uint availableFee = totalFeeReceived;
    require(availableFee > 0, "Fee cannot be split at this time");
    totalFeeReceived = 0;
    uint providers = providersAddress.length;
    uint each = availableFee.div(providers);
    for(uint i = 0; i < providers; i++) {
      address to = providersAddress[i];
      if(to != address(0)) {
        Address.sendValue(payable(to), each);
      }
    }
  }

  function getData() public view returns(
    uint _totalLiquidity,
    uint _swapfee,
    uint _totalFeeReceived,
    uint _totalProvider,
    Provider memory _provider
  ) {
    _totalLiquidity = totalLiquidity;
    _swapfee = swapfee;
    _totalFeeReceived = totalFeeReceived;
    _totalProvider = totalProvider;
    _provider = liqProviders[msg.sender];

    return(
      _totalLiquidity,
      _swapfee,
      _totalFeeReceived,
      _totalProvider,
      _provider
    );
  }


}