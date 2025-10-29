import type { TokenBalance, TokenBalanceRaw, TokenBalanceUtils } from "../types";

/**
 * 通用代币工具类 - 支持任意 ERC20 代币
 */
export class TokenUtils {
  private decimals: number;
  private symbol: string;

  constructor(decimals: number = 18, symbol: string = "TOKEN") {
    this.decimals = decimals;
    this.symbol = symbol;
  }

  /**
   * 将原始区块链值转换为显示格式
   */
  formatFromWei(amount: bigint): number {
    return Number(amount) / Math.pow(10, this.decimals);
  }

  /**
   * 将显示格式转换为原始区块链值
   */
  parseToWei(amount: number): bigint {
    return BigInt(Math.floor(amount * Math.pow(10, this.decimals)));
  }

  /**
   * 格式化数字为显示字符串
   */
  formatForDisplay(amount: number | bigint, decimals: number = 2): string {
    const numericAmount = typeof amount === 'bigint' ? this.formatFromWei(amount) : amount;
    return numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * 格式化为带单位的字符串
   */
  formatWithSymbol(amount: number | bigint, decimals: number = 2): string {
    return `${this.formatForDisplay(amount, decimals)} ${this.symbol}`;
  }

  /**
   * 验证代币数量
   */
  validateAmount(amount: string): {
    isValid: boolean;
    error?: string;
    value?: number;
  } {
    if (!amount || amount.trim() === "") {
      return { isValid: false, error: "Amount is required" };
    }

    const numericValue = parseFloat(amount);

    if (isNaN(numericValue)) {
      return { isValid: false, error: "Invalid amount format" };
    }

    if (numericValue <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    if (numericValue > 1e12) {
      return { isValid: false, error: "Amount is too large" };
    }

    // 检查小数位数
    const decimalPlaces = (amount.split('.')[1] || '').length;
    if (decimalPlaces > this.decimals) {
      return { isValid: false, error: `Too many decimal places (max ${this.decimals})` };
    }

    return { isValid: true, value: numericValue };
  }

  /**
   * 检查余额是否充足
   */
  checkSufficientBalance(amount: number, balance: number): {
    isValid: boolean;
    error?: string;
  } {
    if (amount > balance) {
      return {
        isValid: false,
        error: `Insufficient ${this.symbol} balance. Available: ${this.formatForDisplay(balance)}`,
      };
    }
    return { isValid: true };
  }
}

// 预定义的代币工具实例
export const B3TR = new TokenUtils(18, "B3TR");
export const VOT3 = new TokenUtils(18, "VOT3");

/**
 * 向后兼容的 tokenBalanceUtils
 */
export const tokenBalanceUtils: TokenBalanceUtils = {
  formatBalance: (balance: TokenBalanceRaw): TokenBalance => ({
    b3tr: balance.b3tr,
    vot3: balance.vot3,
    convertedB3tr: BigInt(0),
    availableB3tr: balance.b3tr,
    availableVot3: balance.vot3,
  }),

  parseBalance: (balance: TokenBalance): TokenBalanceRaw => ({
    b3tr: balance.b3tr,
    vot3: balance.vot3,
  }),

  formatForDisplay: (amount: number | bigint, decimals: number = 2): string => {
    return B3TR.formatForDisplay(amount, decimals);
  },
};

/**
 * 创建空的代币余额
 */
export const createEmptyBalance = (): TokenBalance => ({
  b3tr: BigInt(0),
  vot3: BigInt(0),
  convertedB3tr: BigInt(0),
  availableB3tr: BigInt(0),
  availableVot3: BigInt(0),
});

/**
 * 创建空的原始代币余额
 */
export const createEmptyRawBalance = (): TokenBalanceRaw => ({
  b3tr: BigInt(0),
  vot3: BigInt(0),
});

/**
 * 验证代币数量 (向后兼容)
 */
export const validateTokenAmount = (amount: string): {
  isValid: boolean;
  error?: string;
  value?: number;
} => {
  return B3TR.validateAmount(amount);
};

/**
 * 检查余额是否充足 (向后兼容)
 */
export const checkSufficientBalance = (
  amount: number,
  balance: number | bigint,
  tokenType: 'B3TR' | 'VOT3'
): {
  isValid: boolean;
  error?: string;
} => {
  const tokenUtils = tokenType === 'B3TR' ? B3TR : VOT3;
  const numericBalance = typeof balance === 'bigint' ? tokenUtils.formatFromWei(balance) : balance;
  return tokenUtils.checkSufficientBalance(amount, numericBalance);
};

/**
 * 将字符串数量转换为 BigInt (向后兼容)
 */
export const amountToBigInt = (amount: string, tokenType: 'B3TR' | 'VOT3' = 'B3TR'): bigint => {
  const tokenUtils = tokenType === 'B3TR' ? B3TR : VOT3;
  const validation = tokenUtils.validateAmount(amount);
  if (!validation.isValid || !validation.value) {
    throw new Error(validation.error || "Invalid amount");
  }
  return tokenUtils.parseToWei(validation.value);
};

/**
 * 将 BigInt 数量转换为显示字符串 (向后兼容)
 */
export const bigIntToAmount = (amount: bigint, tokenType: 'B3TR' | 'VOT3' = 'B3TR'): string => {
  const tokenUtils = tokenType === 'B3TR' ? B3TR : VOT3;
  return tokenUtils.formatFromWei(amount).toString();
};

/**
 * 通用代币操作工具
 */
export const TokenOperations = {
  /**
   * 创建自定义代币工具
   */
  createToken: (decimals: number, symbol: string) => new TokenUtils(decimals, symbol),

  /**
   * 格式化任意代币数量
   */
  formatAmount: (amount: bigint, decimals: number = 18, displayDecimals: number = 2): string => {
    const value = Number(amount) / Math.pow(10, decimals);
    return value.toLocaleString("en-US", {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
    });
  },

  /**
   * 解析任意代币数量
   */
  parseAmount: (amount: string, decimals: number = 18): bigint => {
    const numericValue = parseFloat(amount);
    if (isNaN(numericValue)) throw new Error("Invalid amount");
    return BigInt(Math.floor(numericValue * Math.pow(10, decimals)));
  },
};
