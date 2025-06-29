# VeDelegate 合约地址配置

## 📋 简化后的合约架构

经过重构，我们将合约地址配置简化为只包含实际使用的合约，提高了代码的可维护性和清晰度。

## 🏗️ 核心合约

| 合约名称 | 地址 | 用途 |
|---------|------|------|
| **VeDelegate** | `0xfc32a9895C78CE00A1047d602Bd81Ea8134CC32b` | 主 staking 合约，管理 staking pools |
| **B3TR** | `0x5ef79995FE8a89e0812330E4378eB2660ceDe699` | B3TR 代币合约 |
| **VOT3** | `0x76Ca782B59C74d088C7D2Cce2f211BC00836c602` | VOT3 投票代币合约 |
| **VePassport** | `0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3` | 护照委托合约 |
| **RewardPool** | `0x838A33AF756a6366f93e201423E1425f67eC0Fa7` | 奖励池合约 |

## 🔄 重构前后对比

### 重构前
- 16 个合约地址
- 多个重复地址
- 复杂的映射关系
- 难以维护

### 重构后
- 5 个核心合约地址
- 无重复地址
- 清晰的功能划分
- 易于维护

## 🎯 设计原则

1. **简单性**: 只保留实际使用的合约
2. **清晰性**: 每个合约都有明确的用途
3. **可维护性**: 减少重复，便于更新
4. **类型安全**: TypeScript 确保所有引用有效

## 📝 使用示例

```typescript
import { Addresses } from "./hooks/consts";

// 查询 B3TR 余额
const balance = await connex.thor
  .account(Addresses.B3TR)
  .method({ name: "balanceOf" })
  .call(userAddress);

// 创建 staking pool
const result = await connex.thor
  .account(Addresses.VeDelegate)
  .method({ name: "createPool" })
  .call(tokenId, userAddress, tokenURI);
```

## 🚀 未来扩展

如果需要添加新的合约地址：

1. 在 `ContractAddresses` 接口中添加新字段
2. 在 `Addresses` 对象中添加对应的地址
3. 更新此文档

## ⚠️ 注意事项

- 所有地址都是 VeChain 主网地址
- 修改地址前请确保新合约已正确部署
- 更新地址后需要重新测试所有相关功能
