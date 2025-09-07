import axios from "axios";

// Interface for swap transaction data
export interface SwapTransaction {
  hash: string;
  timestamp: string;
  protocol: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  action: "Buy" | "Sell";
  contract: string;
}

// Interface for trader statistics
export interface TraderStats {
  address: string;
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  totalVolume: number;
  estimatedPnL: number;
  winRate: number;
  avgTradeSize: number;
  lastTradeTime: string;
  topTokens: { token: string; trades: number }[];
}

// Interface for trade analysis
export interface TradeAnalysis {
  token: string;
  totalTrades: number;
  totalVolume: number;
  avgPrice: number;
  firstTrade: string;
  lastTrade: string;
  estimatedPnL: number;
}

// Comprehensive token mapping based on Aptos fungible assets
// This includes the most common tokens found on Aptos with real contract addresses
const TOKEN_MAPPINGS: { [key: string]: string } = {
  // Aptos native tokens
  "0x1::aptos_coin::AptosCoin": "AptosCoin",
  "0x1::coin::CoinInfo": "AptosCoin",

  // Major stablecoins - Real contract addresses from Aptoscan
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC":
    "USDC",
  "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T":
    "USDT",
  "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecfce5b93b6931b01b4d::coin::T":
    "USDT",

  // Wrapped tokens - Real contract addresses
  "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T":
    "WETH",
  "0xae478ff7d83ed072dbc5e264250e67ef58fa57e12b0f63e327451fdc453f1541::coin::T":
    "WBTC",
  "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T":
    "WAVAX",
  "0x2c7bccf7b31beafd791975b82e3d880fa5aa8b8d2d8d82b4fcc2a1c30823e5ea::coin::T":
    "WMATIC",
  "0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47ca::coin::T":
    "WFTM",
  "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::coin::T":
    "WBNB",

  // DeFi tokens - Real contract addresses
  "0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT":
    "CAKE",
  "0x8c805723ebc0a7c1658ac894c87940e51051dca92b1217b5d8b15fcc3b36f368::coin::T":
    "SUSHI",
};

// Get RPC endpoint from environment variable or use mainnet as fallback
const getRpcEndpoint = (): string => {
  return (
    import.meta.env.VITE_APTOS_RPC || "https://fullnode.mainnet.aptoslabs.com"
  );
};

// Helper function to check if transaction is a swap
const isSwapTransaction = (tx: any): boolean => {
  const functionName = tx.payload?.function || "";
  const lastPart = functionName.split("::").pop() || "";

  return (
    lastPart.includes("swap") ||
    lastPart.includes("exchange") ||
    lastPart.includes("trade") ||
    functionName.includes("swap") ||
    functionName.includes("router") ||
    functionName.includes("aggregator")
  );
};

// Helper function to convert token amounts based on decimals
const convertTokenAmount = (amount: string, tokenType: string): string => {
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;

    // Token decimal places
    if (tokenType.toLowerCase().includes("usdc")) {
      return (numAmount / 1000000).toFixed(6); // USDC has 6 decimals
    } else if (
      tokenType.toLowerCase().includes("aptos") ||
      tokenType.toLowerCase().includes("apt")
    ) {
      return (numAmount / 100000000).toFixed(8); // Aptos Coin has 8 decimals
    } else if (tokenType.toLowerCase().includes("usdt")) {
      return (numAmount / 1000000).toFixed(6); // USDT has 6 decimals
    } else if (tokenType.toLowerCase().includes("weth")) {
      return (numAmount / 1000000000000000000).toFixed(18); // WETH has 18 decimals
    } else {
      // Default to 8 decimals for unknown tokens
      return (numAmount / 100000000).toFixed(8);
    }
  } catch (error) {
    return amount;
  }
};

// Helper function to extract clean token name
const extractTokenName = (tokenType: string): string => {
  if (!tokenType) return "Unknown";

  // First, try exact match with the comprehensive mapping
  if (TOKEN_MAPPINGS[tokenType]) {
    return TOKEN_MAPPINGS[tokenType];
  }

  // Convert to lowercase for easier matching
  const lowerTokenType = tokenType.toLowerCase();

  // Common token mappings - check for specific patterns first
  if (
    lowerTokenType.includes("aptos_coin") ||
    lowerTokenType.includes("aptoscoin")
  ) {
    return "AptosCoin";
  }
  if (lowerTokenType.includes("usdc")) {
    return "USDC";
  }
  if (lowerTokenType.includes("usdt")) {
    return "USDT";
  }
  if (lowerTokenType.includes("weth")) {
    return "WETH";
  }
  if (lowerTokenType.includes("btc")) {
    return "BTC";
  }
  if (lowerTokenType.includes("eth")) {
    return "ETH";
  }
  if (lowerTokenType.includes("sol")) {
    return "SOL";
  }
  if (lowerTokenType.includes("dai")) {
    return "DAI";
  }
  if (lowerTokenType.includes("wbtc")) {
    return "WBTC";
  }

  // Extract from the last part of the type after ::
  const parts = tokenType.split("::");
  const lastPart = parts[parts.length - 1] || tokenType;

  // If it's still a long address, try to extract meaningful name
  if (lastPart.length > 20) {
    // Look for common patterns in the address
    if (lastPart.includes("USDC")) return "USDC";
    if (lastPart.includes("USDT")) return "USDT";
    if (lastPart.includes("APT")) return "AptosCoin";
    if (lastPart.includes("ETH")) return "ETH";
    if (lastPart.includes("BTC")) return "BTC";
    if (lastPart.includes("SOL")) return "SOL";
    if (lastPart.includes("DAI")) return "DAI";
    if (lastPart.includes("WBTC")) return "WBTC";
    if (lastPart.includes("MATIC")) return "MATIC";
    if (lastPart.includes("AVAX")) return "AVAX";
    if (lastPart.includes("DOT")) return "DOT";
    if (lastPart.includes("LINK")) return "LINK";
    if (lastPart.includes("UNI")) return "UNI";
    if (lastPart.includes("AAVE")) return "AAVE";
    if (lastPart.includes("COMP")) return "COMP";
    if (lastPart.includes("MKR")) return "MKR";
    if (lastPart.includes("SNX")) return "SNX";
    if (lastPart.includes("YFI")) return "YFI";
    if (lastPart.includes("CRV")) return "CRV";
    if (lastPart.includes("SUSHI")) return "SUSHI";
    if (lastPart.includes("1INCH")) return "1INCH";
    if (lastPart.includes("BAL")) return "BAL";
    if (lastPart.includes("LDO")) return "LDO";
    if (lastPart.includes("APE")) return "APE";
    if (lastPart.includes("SHIB")) return "SHIB";
    if (lastPart.includes("DOGE")) return "DOGE";
    if (lastPart.includes("ADA")) return "ADA";
    if (lastPart.includes("XRP")) return "XRP";
    if (lastPart.includes("LTC")) return "LTC";
    if (lastPart.includes("BCH")) return "BCH";
    if (lastPart.includes("EOS")) return "EOS";
    if (lastPart.includes("TRX")) return "TRX";
    if (lastPart.includes("XLM")) return "XLM";
    if (lastPart.includes("VET")) return "VET";
    if (lastPart.includes("FIL")) return "FIL";
    if (lastPart.includes("ATOM")) return "ATOM";
    if (lastPart.includes("NEAR")) return "NEAR";
    if (lastPart.includes("FTM")) return "FTM";
    if (lastPart.includes("ALGO")) return "ALGO";
    if (lastPart.includes("ICP")) return "ICP";
    if (lastPart.includes("FLOW")) return "FLOW";
    if (lastPart.includes("HBAR")) return "HBAR";
    if (lastPart.includes("XTZ")) return "XTZ";
    if (lastPart.includes("EGLD")) return "EGLD";
    if (lastPart.includes("THETA")) return "THETA";
    if (lastPart.includes("ZEC")) return "ZEC";
    if (lastPart.includes("DASH")) return "DASH";
    if (lastPart.includes("NEO")) return "NEO";
    if (lastPart.includes("IOTA")) return "IOTA";
    if (lastPart.includes("ZIL")) return "ZIL";
    if (lastPart.includes("ONT")) return "ONT";
    if (lastPart.includes("QTUM")) return "QTUM";
    if (lastPart.includes("WAVES")) return "WAVES";
    if (lastPart.includes("KSM")) return "KSM";
    if (lastPart.includes("DCR")) return "DCR";
    if (lastPart.includes("BAT")) return "BAT";
    if (lastPart.includes("ZRX")) return "ZRX";
    if (lastPart.includes("REP")) return "REP";
    if (lastPart.includes("KNC")) return "KNC";
    if (lastPart.includes("LRC")) return "LRC";
    if (lastPart.includes("OMG")) return "OMG";
    if (lastPart.includes("STORJ")) return "STORJ";
    if (lastPart.includes("GNT")) return "GNT";
    if (lastPart.includes("FUN")) return "FUN";
    if (lastPart.includes("REQ")) return "REQ";
    if (lastPart.includes("CVC")) return "CVC";
    if (lastPart.includes("TNT")) return "TNT";
    if (lastPart.includes("ADX")) return "ADX";
    if (lastPart.includes("MTL")) return "MTL";
    if (lastPart.includes("DNT")) return "DNT";
    if (lastPart.includes("VIB")) return "VIB";
    if (lastPart.includes("TRST")) return "TRST";
    if (lastPart.includes("POWR")) return "POWR";
    if (lastPart.includes("BNT")) return "BNT";
    if (lastPart.includes("MANA")) return "MANA";
    if (lastPart.includes("SALT")) return "SALT";
    if (lastPart.includes("EDG")) return "EDG";
    if (lastPart.includes("BNB")) return "BNB";
    if (lastPart.includes("CAKE")) return "CAKE";
    if (lastPart.includes("BUSD")) return "BUSD";
    if (lastPart.includes("USDD")) return "USDD";
    if (lastPart.includes("TUSD")) return "TUSD";
    if (lastPart.includes("FRAX")) return "FRAX";
    if (lastPart.includes("LUSD")) return "LUSD";
    if (lastPart.includes("SUSD")) return "SUSD";
    if (lastPart.includes("GUSD")) return "GUSD";
    if (lastPart.includes("PAX")) return "PAX";
    if (lastPart.includes("USDP")) return "USDP";
    if (lastPart.includes("RAI")) return "RAI";
    if (lastPart.includes("FEI")) return "FEI";
    if (lastPart.includes("TRIBE")) return "TRIBE";
    if (lastPart.includes("LQTY")) return "LQTY";
    if (lastPart.includes("CVX")) return "CVX";
    if (lastPart.includes("FXS")) return "FXS";
    if (lastPart.includes("CRV")) return "CRV";
    if (lastPart.includes("SPELL")) return "SPELL";
    if (lastPart.includes("MIM")) return "MIM";
    if (lastPart.includes("UST")) return "UST";
    if (lastPart.includes("LUNA")) return "LUNA";
    if (lastPart.includes("ANC")) return "ANC";
    if (lastPart.includes("MIR")) return "MIR";
    if (lastPart.includes("ORION")) return "ORION";
    if (lastPart.includes("ORCA")) return "ORCA";
    if (lastPart.includes("RAY")) return "RAY";
    if (lastPart.includes("SRM")) return "SRM";
    if (lastPart.includes("MSOL")) return "MSOL";
    if (lastPart.includes("STSOL")) return "STSOL";
    if (lastPart.includes("USDCet")) return "USDC";
    if (lastPart.includes("USDTet")) return "USDT";
    if (lastPart.includes("WETHet")) return "WETH";
    if (lastPart.includes("WBTCet")) return "WBTC";
    if (lastPart.includes("WAVAXet")) return "WAVAX";
    if (lastPart.includes("WMATICet")) return "WMATIC";
    if (lastPart.includes("WFTMet")) return "WFTM";
    if (lastPart.includes("WBNBet")) return "WBNB";
    if (lastPart.includes("WADAet")) return "WADA";
    if (lastPart.includes("WDOTet")) return "WDOT";
    if (lastPart.includes("WLINKet")) return "WLINK";
    if (lastPart.includes("WUNIet")) return "WUNI";
    if (lastPart.includes("WAAVEet")) return "WAAVE";
    if (lastPart.includes("WCOMPet")) return "WCOMP";
    if (lastPart.includes("WMKRet")) return "WMKR";
    if (lastPart.includes("WSNXet")) return "WSNX";
    if (lastPart.includes("WYFIet")) return "WYFI";
    if (lastPart.includes("WCRVet")) return "WCRV";
    if (lastPart.includes("WSUSHIet")) return "WSUSHI";
    if (lastPart.includes("W1INCHet")) return "W1INCH";
    if (lastPart.includes("WBALet")) return "WBAL";
    if (lastPart.includes("WLDOet")) return "WLDO";
    if (lastPart.includes("WAPEet")) return "WAPE";
    if (lastPart.includes("WSHIBet")) return "WSHIB";
    if (lastPart.includes("WDOGEet")) return "WDOGE";
    if (lastPart.includes("WADAet")) return "WADA";
    if (lastPart.includes("WXRPet")) return "WXRP";
    if (lastPart.includes("WLTCet")) return "WLTC";
    if (lastPart.includes("WBCHet")) return "WBCH";
    if (lastPart.includes("WEOSet")) return "WEOS";
    if (lastPart.includes("WTRXet")) return "WTRX";
    if (lastPart.includes("WXLMet")) return "WXLM";
    if (lastPart.includes("WVETet")) return "WVET";
    if (lastPart.includes("WFILet")) return "WFIL";
    if (lastPart.includes("WATOMet")) return "WATOM";
    if (lastPart.includes("WNEARet")) return "WNEAR";
    if (lastPart.includes("WFTMet")) return "WFTM";
    if (lastPart.includes("WALGOet")) return "WALGO";
    if (lastPart.includes("WICPet")) return "WICP";
    if (lastPart.includes("WFLOWet")) return "WFLOW";
    if (lastPart.includes("WHBARet")) return "WHBAR";
    if (lastPart.includes("WXTZet")) return "WXTZ";
    if (lastPart.includes("WEGLDet")) return "WEGLD";
    if (lastPart.includes("WTHETAet")) return "WTHETA";
    if (lastPart.includes("WZECet")) return "WZEC";
    if (lastPart.includes("WDASHet")) return "WDASH";
    if (lastPart.includes("WNEOet")) return "WNEO";
    if (lastPart.includes("WIOTAet")) return "WIOTA";
    if (lastPart.includes("WZILet")) return "WZIL";
    if (lastPart.includes("WONTet")) return "WONT";
    if (lastPart.includes("WQTUMet")) return "WQTUM";
    if (lastPart.includes("WWAVESet")) return "WWAVES";
    if (lastPart.includes("WKSMet")) return "WKSM";
    if (lastPart.includes("WDCRet")) return "WDCR";
    if (lastPart.includes("WBATet")) return "WBAT";
    if (lastPart.includes("WZRXet")) return "WZRX";
    if (lastPart.includes("WREPet")) return "WREP";
    if (lastPart.includes("WKNCet")) return "WKNC";
    if (lastPart.includes("WLRCet")) return "WLRC";
    if (lastPart.includes("WOMGet")) return "WOMG";
    if (lastPart.includes("WSTORJet")) return "WSTORJ";
    if (lastPart.includes("WGNTet")) return "WGNT";
    if (lastPart.includes("WFUNet")) return "WFUN";
    if (lastPart.includes("WREQet")) return "WREQ";
    if (lastPart.includes("WCVCet")) return "WCVC";
    if (lastPart.includes("WTNTet")) return "WTNT";
    if (lastPart.includes("WADXet")) return "WADX";
    if (lastPart.includes("WMTLet")) return "WMTL";
    if (lastPart.includes("WDNTet")) return "WDNT";
    if (lastPart.includes("WVIBet")) return "WVIB";
    if (lastPart.includes("WTRSTet")) return "WTRST";
    if (lastPart.includes("WPOWRet")) return "WPOWR";
    if (lastPart.includes("WBNTet")) return "WBNT";
    if (lastPart.includes("WMANAet")) return "WMANA";
    if (lastPart.includes("WSALTet")) return "WSALT";
    if (lastPart.includes("WEDGet")) return "WEDG";
    if (lastPart.includes("WBNBet")) return "WBNB";
    if (lastPart.includes("WCAKEet")) return "WCAKE";
    if (lastPart.includes("WBUSDet")) return "WBUSD";
    if (lastPart.includes("WUSDDet")) return "WUSDD";
    if (lastPart.includes("WTUSDet")) return "WTUSD";
    if (lastPart.includes("WFRAXet")) return "WFRAX";
    if (lastPart.includes("WLUSDet")) return "WLUSD";
    if (lastPart.includes("WSUSDet")) return "WSUSD";
    if (lastPart.includes("WGUSDet")) return "WGUSD";
    if (lastPart.includes("WPAXet")) return "WPAX";
    if (lastPart.includes("WUSDPet")) return "WUSDP";
    if (lastPart.includes("WRAIet")) return "WRAI";
    if (lastPart.includes("WFEIet")) return "WFEI";
    if (lastPart.includes("WTRIBEet")) return "WTRIBE";
    if (lastPart.includes("WLQTYet")) return "WLQTY";
    if (lastPart.includes("WCVXet")) return "WCVX";
    if (lastPart.includes("WFXSet")) return "WFXS";
    if (lastPart.includes("WCRVet")) return "WCRV";
    if (lastPart.includes("WSPELLet")) return "WSPELL";
    if (lastPart.includes("WMIMet")) return "WMIM";
    if (lastPart.includes("WUSTet")) return "WUST";
    if (lastPart.includes("WLUNAet")) return "WLUNA";
    if (lastPart.includes("WANCet")) return "WANC";
    if (lastPart.includes("WMIRet")) return "WMIR";
    if (lastPart.includes("WORIONet")) return "WORION";
    if (lastPart.includes("WORCAet")) return "WORCA";
    if (lastPart.includes("WRAYet")) return "WRAY";
    if (lastPart.includes("WSRMet")) return "WSRM";
    if (lastPart.includes("WMSOLet")) return "WMSOL";
    if (lastPart.includes("WSTSOLet")) return "WSTSOL";

    // If it's a long hex string, try to extract from the full token type
    if (/^0x[a-fA-F0-9]+$/.test(lastPart)) {
      // Try to extract token name from the full token type string
      const fullTokenType = tokenType.toLowerCase();
      if (fullTokenType.includes("usdc")) return "USDC";
      if (fullTokenType.includes("usdt")) return "USDT";
      if (fullTokenType.includes("aptos")) return "AptosCoin";
      if (fullTokenType.includes("eth")) return "ETH";
      if (fullTokenType.includes("btc")) return "BTC";
      if (fullTokenType.includes("sol")) return "SOL";
      if (fullTokenType.includes("dai")) return "DAI";
      if (fullTokenType.includes("wbtc")) return "WBTC";
      if (fullTokenType.includes("matic")) return "MATIC";
      if (fullTokenType.includes("avax")) return "AVAX";
      if (fullTokenType.includes("dot")) return "DOT";
      if (fullTokenType.includes("link")) return "LINK";
      if (fullTokenType.includes("uni")) return "UNI";
      if (fullTokenType.includes("aave")) return "AAVE";
      if (fullTokenType.includes("comp")) return "COMP";
      if (fullTokenType.includes("mkr")) return "MKR";
      if (fullTokenType.includes("snx")) return "SNX";
      if (fullTokenType.includes("yfi")) return "YFI";
      if (fullTokenType.includes("crv")) return "CRV";
      if (fullTokenType.includes("sushi")) return "SUSHI";
      if (fullTokenType.includes("1inch")) return "1INCH";
      if (fullTokenType.includes("bal")) return "BAL";
      if (fullTokenType.includes("ldo")) return "LDO";
      if (fullTokenType.includes("ape")) return "APE";
      if (fullTokenType.includes("shib")) return "SHIB";
      if (fullTokenType.includes("doge")) return "DOGE";
      if (fullTokenType.includes("ada")) return "ADA";
      if (fullTokenType.includes("xrp")) return "XRP";
      if (fullTokenType.includes("ltc")) return "LTC";
      if (fullTokenType.includes("bch")) return "BCH";
      if (fullTokenType.includes("eos")) return "EOS";
      if (fullTokenType.includes("trx")) return "TRX";
      if (fullTokenType.includes("xlm")) return "XLM";
      if (fullTokenType.includes("vet")) return "VET";
      if (fullTokenType.includes("fil")) return "FIL";
      if (fullTokenType.includes("atom")) return "ATOM";
      if (fullTokenType.includes("near")) return "NEAR";
      if (fullTokenType.includes("ftm")) return "FTM";
      if (fullTokenType.includes("algo")) return "ALGO";
      if (fullTokenType.includes("icp")) return "ICP";
      if (fullTokenType.includes("flow")) return "FLOW";
      if (fullTokenType.includes("hbar")) return "HBAR";
      if (fullTokenType.includes("xtz")) return "XTZ";
      if (fullTokenType.includes("egld")) return "EGLD";
      if (fullTokenType.includes("theta")) return "THETA";
      if (fullTokenType.includes("zec")) return "ZEC";
      if (fullTokenType.includes("dash")) return "DASH";
      if (fullTokenType.includes("neo")) return "NEO";
      if (fullTokenType.includes("iota")) return "IOTA";
      if (fullTokenType.includes("zil")) return "ZIL";
      if (fullTokenType.includes("ont")) return "ONT";
      if (fullTokenType.includes("qtum")) return "QTUM";
      if (fullTokenType.includes("waves")) return "WAVES";
      if (fullTokenType.includes("ksm")) return "KSM";
      if (fullTokenType.includes("dcr")) return "DCR";
      if (fullTokenType.includes("bat")) return "BAT";
      if (fullTokenType.includes("zrx")) return "ZRX";
      if (fullTokenType.includes("rep")) return "REP";
      if (fullTokenType.includes("knc")) return "KNC";
      if (fullTokenType.includes("lrc")) return "LRC";
      if (fullTokenType.includes("omg")) return "OMG";
      if (fullTokenType.includes("storj")) return "STORJ";
      if (fullTokenType.includes("gnt")) return "GNT";
      if (fullTokenType.includes("fun")) return "FUN";
      if (fullTokenType.includes("req")) return "REQ";
      if (fullTokenType.includes("cvc")) return "CVC";
      if (fullTokenType.includes("tnt")) return "TNT";
      if (fullTokenType.includes("adx")) return "ADX";
      if (fullTokenType.includes("mtl")) return "MTL";
      if (fullTokenType.includes("dnt")) return "DNT";
      if (fullTokenType.includes("vib")) return "VIB";
      if (fullTokenType.includes("trst")) return "TRST";
      if (fullTokenType.includes("powr")) return "POWR";
      if (fullTokenType.includes("bnt")) return "BNT";
      if (fullTokenType.includes("mana")) return "MANA";
      if (fullTokenType.includes("salt")) return "SALT";
      if (fullTokenType.includes("edg")) return "EDG";
      if (fullTokenType.includes("bnb")) return "BNB";
      if (fullTokenType.includes("cake")) return "CAKE";
      if (fullTokenType.includes("busd")) return "BUSD";
      if (fullTokenType.includes("usdd")) return "USDD";
      if (fullTokenType.includes("tusd")) return "TUSD";
      if (fullTokenType.includes("frax")) return "FRAX";
      if (fullTokenType.includes("lusd")) return "LUSD";
      if (fullTokenType.includes("susd")) return "SUSD";
      if (fullTokenType.includes("gusd")) return "GUSD";
      if (fullTokenType.includes("pax")) return "PAX";
      if (fullTokenType.includes("usdp")) return "USDP";
      if (fullTokenType.includes("rai")) return "RAI";
      if (fullTokenType.includes("fei")) return "FEI";
      if (fullTokenType.includes("tribe")) return "TRIBE";
      if (fullTokenType.includes("lqty")) return "LQTY";
      if (fullTokenType.includes("cvx")) return "CVX";
      if (fullTokenType.includes("fxs")) return "FXS";
      if (fullTokenType.includes("crv")) return "CRV";
      if (fullTokenType.includes("spell")) return "SPELL";
      if (fullTokenType.includes("mim")) return "MIM";
      if (fullTokenType.includes("ust")) return "UST";
      if (fullTokenType.includes("luna")) return "LUNA";
      if (fullTokenType.includes("anc")) return "ANC";
      if (fullTokenType.includes("mir")) return "MIR";
      if (fullTokenType.includes("orion")) return "ORION";
      if (fullTokenType.includes("orca")) return "ORCA";
      if (fullTokenType.includes("ray")) return "RAY";
      if (fullTokenType.includes("srm")) return "SRM";
      if (fullTokenType.includes("msol")) return "MSOL";
      if (fullTokenType.includes("stsol")) return "STSOL";

      // If still no match, return "Token"
      return "Token";
    }
  }

  return lastPart;
};

// Helper function to extract swap token information
const extractSwapInfo = (
  tx: any
): {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  action: "Buy" | "Sell";
} => {
  try {
    let fromToken = "N/A";
    let toToken = "N/A";
    let fromAmount = "N/A";
    let toAmount = "N/A";
    let action: "Buy" | "Sell" = "Buy";

    // Try to extract from events (most reliable for swaps)
    if (tx.events && tx.events.length > 0) {
      for (const event of tx.events) {
        if (event.type && event.data) {
          // Look for swap events
          if (event.type.includes("Swap") || event.type.includes("swap")) {
            if (event.data.from_amount && event.data.to_amount) {
              fromAmount = event.data.from_amount.toString();
              toAmount = event.data.to_amount.toString();
            }
            if (event.data.from_token && event.data.to_token) {
              fromToken = extractTokenName(event.data.from_token);
              toToken = extractTokenName(event.data.to_token);
            }
          }
        }
      }
    }

    // Try to extract from payload arguments
    if (tx.payload?.arguments && tx.payload.arguments.length > 0) {
      if (fromAmount === "N/A") {
        fromAmount = tx.payload.arguments[0]?.toString() || "N/A";
      }
      if (toAmount === "N/A" && tx.payload.arguments.length > 1) {
        toAmount = tx.payload.arguments[1]?.toString() || "N/A";
      }
    }

    // Try to get tokens from type arguments
    if (tx.payload?.type_arguments && tx.payload.type_arguments.length > 0) {
      if (fromToken === "N/A") {
        const fromTokenType = tx.payload.type_arguments[0];
        fromToken = extractTokenName(fromTokenType);
      }
      if (toToken === "N/A" && tx.payload.type_arguments.length > 1) {
        const toTokenType = tx.payload.type_arguments[1];
        toToken = extractTokenName(toTokenType);
      }
    }

    // Convert amounts based on token decimals
    if (fromAmount !== "N/A" && fromToken !== "N/A") {
      fromAmount = convertTokenAmount(fromAmount, fromToken);
    }
    if (toAmount !== "N/A" && toToken !== "N/A") {
      toAmount = convertTokenAmount(toAmount, toToken);
    }

    // Determine buy/sell action
    // If swapping FROM Aptos Coin TO another token = Buy
    // If swapping FROM another token TO Aptos Coin or USDC = Sell
    if (
      fromToken.toLowerCase().includes("aptos") ||
      fromToken.toLowerCase().includes("apt")
    ) {
      action = "Buy";
    } else if (
      toToken.toLowerCase().includes("aptos") ||
      toToken.toLowerCase().includes("apt") ||
      toToken.toLowerCase().includes("usdc")
    ) {
      action = "Sell";
    }

    return { fromToken, toToken, fromAmount, toAmount, action };
  } catch (error) {
    return {
      fromToken: "N/A",
      toToken: "N/A",
      fromAmount: "N/A",
      toAmount: "N/A",
      action: "Buy",
    };
  }
};

/**
 * Fetch swap transactions for a given Aptos address
 * @param address - The Aptos wallet address
 * @param limit - Number of transactions to fetch (default: 50)
 * @returns Promise<SwapTransaction[]> - Array of parsed swap transactions
 */
export const fetchTransactions = async (
  address: string,
  limit: number = 50
): Promise<SwapTransaction[]> => {
  try {
    const rpcEndpoint = getRpcEndpoint();
    const url = `${rpcEndpoint}/v1/accounts/${address}/transactions?limit=${limit}`;

    const options = {
      method: "GET",
      url: url,
      headers: { Accept: "application/json, application/x-bcs" },
    };

    const response = await axios.request(options);

    // Filter and parse only swap transactions, reverse order (most recent first)
    const swapTransactions: SwapTransaction[] = response.data
      .filter((tx: any) => isSwapTransaction(tx))
      .reverse() // Most recent transactions first
      .map((tx: any) => {
        const { fromToken, toToken, fromAmount, toAmount, action } =
          extractSwapInfo(tx);

        return {
          hash: tx.hash || "N/A",
          timestamp: tx.timestamp
            ? new Date(Number(tx.timestamp) / 1000).toLocaleString()
            : "N/A",
          protocol: "N/A", // Removed protocol detection
          fromToken,
          toToken,
          fromAmount,
          toAmount,
          action,
          contract: tx.payload?.function || "N/A",
        };
      })
      // Filter out transactions with N/A data
      .filter(
        (tx: SwapTransaction) =>
          tx.fromToken !== "N/A" &&
          tx.toToken !== "N/A" &&
          tx.fromAmount !== "N/A" &&
          tx.toAmount !== "N/A" &&
          tx.hash !== "N/A"
      );

    return swapTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);

    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Address not found or has no transactions");
      } else if (error.response && error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR") {
        throw new Error("Network error. Please check your connection.");
      }
    }

    throw new Error("Failed to fetch transactions. Please try again.");
  }
};

// Helper function to calculate estimated PnL for a trader
const calculateEstimatedPnL = (transactions: SwapTransaction[]): number => {
  const tokenHoldings: {
    [token: string]: { amount: number; avgPrice: number };
  } = {};
  let totalPnL = 0;

  for (const tx of transactions) {
    const fromAmount = parseFloat(tx.fromAmount) || 0;
    const toAmount = parseFloat(tx.toAmount) || 0;

    if (tx.action === "Buy") {
      // Buying token with AptosCoin
      const token = tx.toToken;
      const aptPrice = fromAmount / toAmount; // Price in AptosCoin per token

      if (!tokenHoldings[token]) {
        tokenHoldings[token] = { amount: 0, avgPrice: 0 };
      }

      const currentAmount = tokenHoldings[token].amount;
      const currentAvgPrice = tokenHoldings[token].avgPrice;
      const newAmount = currentAmount + toAmount;
      const newAvgPrice =
        currentAmount > 0
          ? (currentAmount * currentAvgPrice + toAmount * aptPrice) / newAmount
          : aptPrice;

      tokenHoldings[token] = { amount: newAmount, avgPrice: newAvgPrice };
    } else if (tx.action === "Sell") {
      // Selling token for AptosCoin
      const token = tx.fromToken;
      const aptReceived = toAmount;
      const tokensSold = fromAmount;

      if (tokenHoldings[token] && tokenHoldings[token].amount > 0) {
        const avgPrice = tokenHoldings[token].avgPrice;
        const costBasis = tokensSold * avgPrice;
        const pnl = aptReceived - costBasis;
        totalPnL += pnl;

        tokenHoldings[token].amount -= tokensSold;
        if (tokenHoldings[token].amount < 0) {
          tokenHoldings[token].amount = 0;
        }
      }
    }
  }

  return totalPnL;
};

// Helper function to get top tokens by trade count
const getTopTokens = (
  transactions: SwapTransaction[]
): { token: string; trades: number }[] => {
  const tokenCounts: { [token: string]: number } = {};

  for (const tx of transactions) {
    if (tx.action === "Buy") {
      tokenCounts[tx.toToken] = (tokenCounts[tx.toToken] || 0) + 1;
    } else if (tx.action === "Sell") {
      tokenCounts[tx.fromToken] = (tokenCounts[tx.fromToken] || 0) + 1;
    }
  }

  return Object.entries(tokenCounts)
    .map(([token, trades]) => ({ token, trades }))
    .sort((a, b) => b.trades - a.trades)
    .slice(0, 5);
};

// Calculate trader statistics
export const calculateTraderStats = (
  address: string,
  transactions: SwapTransaction[]
): TraderStats => {
  const buyTrades = transactions.filter((tx) => tx.action === "Buy").length;
  const sellTrades = transactions.filter((tx) => tx.action === "Sell").length;
  const totalTrades = transactions.length;

  // Calculate total volume (in AptosCoin equivalent)
  const totalVolume = transactions.reduce((sum, tx) => {
    if (tx.action === "Buy") {
      return sum + (parseFloat(tx.fromAmount) || 0);
    } else {
      return sum + (parseFloat(tx.toAmount) || 0);
    }
  }, 0);

  const estimatedPnL = calculateEstimatedPnL(transactions);
  const winRate =
    totalTrades > 0 ? ((buyTrades + sellTrades) / totalTrades) * 100 : 0;
  const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
  const lastTradeTime =
    transactions.length > 0 ? transactions[0].timestamp : "N/A";
  const topTokens = getTopTokens(transactions);

  return {
    address,
    totalTrades,
    buyTrades,
    sellTrades,
    totalVolume,
    estimatedPnL,
    winRate,
    avgTradeSize,
    lastTradeTime,
    topTokens,
  };
};

// Fetch multiple traders' data
export const fetchMultipleTraders = async (
  addresses: string[]
): Promise<TraderStats[]> => {
  const traderStats: TraderStats[] = [];

  for (const address of addresses) {
    try {
      const transactions = await fetchTransactions(address, 100);
      const stats = calculateTraderStats(address, transactions);
      traderStats.push(stats);
    } catch (error) {
      console.error(`Error fetching data for ${address}:`, error);
      // Add empty stats for failed addresses
      traderStats.push({
        address,
        totalTrades: 0,
        buyTrades: 0,
        sellTrades: 0,
        totalVolume: 0,
        estimatedPnL: 0,
        winRate: 0,
        avgTradeSize: 0,
        lastTradeTime: "N/A",
        topTokens: [],
      });
    }
  }

  return traderStats.sort((a, b) => b.estimatedPnL - a.estimatedPnL);
};

// Get detailed trade analysis for a specific trader
export const getTraderAnalysis = async (
  address: string
): Promise<{
  stats: TraderStats;
  transactions: SwapTransaction[];
  tokenAnalysis: TradeAnalysis[];
}> => {
  const transactions = await fetchTransactions(address, 100);
  const stats = calculateTraderStats(address, transactions);

  // Analyze trades by token
  const tokenAnalysis: TradeAnalysis[] = [];
  const tokenData: {
    [token: string]: {
      trades: SwapTransaction[];
      totalVolume: number;
      buyVolume: number;
      sellVolume: number;
    };
  } = {};

  for (const tx of transactions) {
    const token = tx.action === "Buy" ? tx.toToken : tx.fromToken;
    if (!tokenData[token]) {
      tokenData[token] = {
        trades: [],
        totalVolume: 0,
        buyVolume: 0,
        sellVolume: 0,
      };
    }

    tokenData[token].trades.push(tx);
    const volume =
      tx.action === "Buy" ? parseFloat(tx.fromAmount) : parseFloat(tx.toAmount);
    tokenData[token].totalVolume += volume;

    if (tx.action === "Buy") {
      tokenData[token].buyVolume += parseFloat(tx.fromAmount);
    } else {
      tokenData[token].sellVolume += parseFloat(tx.toAmount);
    }
  }

  for (const [token, data] of Object.entries(tokenData)) {
    const tokenPnL = calculateEstimatedPnL(data.trades);
    const avgPrice =
      data.trades.length > 0 ? data.totalVolume / data.trades.length : 0;

    tokenAnalysis.push({
      token,
      totalTrades: data.trades.length,
      totalVolume: data.totalVolume,
      avgPrice,
      firstTrade: data.trades[data.trades.length - 1]?.timestamp || "N/A",
      lastTrade: data.trades[0]?.timestamp || "N/A",
      estimatedPnL: tokenPnL,
    });
  }

  return {
    stats,
    transactions,
    tokenAnalysis: tokenAnalysis.sort((a, b) => b.totalTrades - a.totalTrades),
  };
};
