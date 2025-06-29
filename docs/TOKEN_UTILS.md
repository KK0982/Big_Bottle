# 通用代币工具 (Token Utils)

## 📋 概述

重构后的代币工具提供了更通用、灵活的代币操作功能，支持任意 ERC20 代币，同时保持向后兼容性。

## 🏗️ 核心架构

### TokenUtils 类

通用代币工具类，支持任意精度和符号的代币：

```typescript
class TokenUtils {
  constructor(decimals: number = 18, symbol: string = "TOKEN")
  
  // 核心方法
  formatFromWei(amount: bigint): number
  parseToWei(amount: number): bigint
  formatForDisplay(amount: number | bigint, decimals?: number): string
  formatWithSymbol(amount: number | bigint, decimals?: number): string
  validateAmount(amount: string): ValidationResult
  checkSufficientBalance(amount: number, balance: number): ValidationResult
}
```

## 🎯 使用示例

### 1. 预定义代币实例

```typescript
import { B3TR, VOT3 } from "../utils/token-balance";

// B3TR 操作
const b3trAmount = B3TR.parseToWei(100); // 100 B3TR -> BigInt
const displayAmount = B3TR.formatFromWei(b3trAmount); // BigInt -> 100
const formatted = B3TR.formatWithSymbol(100, 2); // "100.00 B3TR"

// VOT3 操作
const vot3Validation = VOT3.validateAmount("50.5");
if (vot3Validation.isValid) {
  const vot3Amount = VOT3.parseToWei(vot3Validation.value!);
}
```

### 2. 自定义代币

```typescript
import { TokenOperations } from "../utils/token-balance";

// 创建 USDC (6 位小数)
const USDC = TokenOperations.createToken(6, "USDC");

// 创建自定义代币 (8 位小数)
const CustomToken = TokenOperations.createToken(8, "CUSTOM");

// 使用
const usdcAmount = USDC.parseToWei(100); // 100 USDC
const display = USDC.formatWithSymbol(usdcAmount, 2); // "100.00 USDC"
```

### 3. 通用操作

```typescript
import { TokenOperations } from "../utils/token-balance";

// 格式化任意代币
const formatted = TokenOperations.formatAmount(
  BigInt("1000000000000000000"), // 1e18
  18, // decimals
  4   // display decimals
); // "1.0000"

// 解析任意代币
const parsed = TokenOperations.parseAmount("123.456", 18);
```

### 4. 向后兼容使用

```typescript
import { 
  tokenBalanceUtils, 
  validateTokenAmount, 
  checkSufficientBalance,
  amountToBigInt 
} from "../utils/token-balance";

// 原有代码无需修改
const validation = validateTokenAmount("100");
const balance = checkSufficientBalance(100, 200, 'B3TR');
const amount = amountToBigInt("100", 'B3TR');
```

## 🔧 API 参考

### TokenUtils 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `formatFromWei` | `amount: bigint` | `number` | 将 Wei 转换为显示数值 |
| `parseToWei` | `amount: number` | `bigint` | 将显示数值转换为 Wei |
| `formatForDisplay` | `amount: number\|bigint, decimals?: number` | `string` | 格式化为显示字符串 |
| `formatWithSymbol` | `amount: number\|bigint, decimals?: number` | `string` | 格式化为带符号的字符串 |
| `validateAmount` | `amount: string` | `ValidationResult` | 验证数量格式 |
| `checkSufficientBalance` | `amount: number, balance: number` | `ValidationResult` | 检查余额充足性 |

### TokenOperations 工具

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `createToken` | `decimals: number, symbol: string` | `TokenUtils` | 创建代币工具实例 |
| `formatAmount` | `amount: bigint, decimals?: number, displayDecimals?: number` | `string` | 通用格式化 |
| `parseAmount` | `amount: string, decimals?: number` | `bigint` | 通用解析 |

## 🚀 优势

1. **通用性**: 支持任意 ERC20 代币
2. **类型安全**: 完整的 TypeScript 支持
3. **向后兼容**: 现有代码无需修改
4. **灵活性**: 可自定义精度和符号
5. **可扩展**: 易于添加新功能

## 📝 迁移指南

### 从旧版本迁移

```typescript
// 旧版本
const formatted = tokenBalanceUtils.formatForDisplay(100, 2);

// 新版本 (推荐)
const formatted = B3TR.formatForDisplay(100, 2);

// 或者继续使用旧接口 (向后兼容)
const formatted = tokenBalanceUtils.formatForDisplay(100, 2);
```

### 添加新代币支持

```typescript
// 1. 创建代币工具
export const NewToken = new TokenUtils(18, "NEW");

// 2. 在组件中使用
const amount = NewToken.parseToWei(userInput);
const display = NewToken.formatWithSymbol(amount);
```

## ⚠️ 注意事项

- BigInt 运算避免精度丢失
- 验证用户输入防止错误
- 使用适当的小数位数显示
- 考虑不同代币的精度差异
