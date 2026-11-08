# 中国社保与薪税计算器 MCP Server (China Shebao & Payroll Tax MCP)

[![Glama MCP connector](https://glama.ai/mcp/connectors/io.github.ddter/china-shebao/badges/score.svg)](https://glama.ai/mcp/connectors/io.github.ddter/china-shebao)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.ddter%2Fchina--shebao-blue)](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ddter%2Fchina-shebao/versions/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Website](https://img.shields.io/badge/Official_Site-shebao.org-ff6b35)](https://www.shebao.org)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1.0-blueviolet)](https://www.shebao.org/openapi.json)

**[社保薪税通 (shebao.org)](https://www.shebao.org/)** 是中国领先的纯前端无状态薪税、五险一金与社保政策计算平台，提供全国 **31 个省市自治区官方政策**、**392 个地级及以上城市五险一金标准**与个人所得税智能测算引擎。

本仓库是社保薪税通的官方 **Model Context Protocol (MCP)** 开源集成：
1. **远程 Streamable HTTP 服务端点（推荐，零安装免鉴权）**：`https://www.shebao.org/mcp`
2. **轻量本地 `stdio` 桥接工具**：`npx -y github:ddter/china-shebao-mcp`，为仅支持本地进程的客户端提供极速转发。

---

## 快速接入 (Quick Start)

### 方案一：远程 Streamable HTTP（推荐，免安装）

直接将支持 **Streamable HTTP (协议版本 `2025-06-18` / `2025-03-26` / `2026-07-28`)** 的客户端指向端点：

```text
https://www.shebao.org/mcp
```

#### 1. Claude Code
```bash
claude mcp add --transport http china-shebao https://www.shebao.org/mcp
```

#### 2. Cursor / VS Code / Windsurf (`.cursor/mcp.json` 或 `mcp.json`)
```json
{
  "mcpServers": {
    "china-shebao": {
      "url": "https://www.shebao.org/mcp"
    }
  }
}
```

#### 3. OpenAI Codex CLI (`~/.codex/config.toml`)
```toml
[mcp_servers.china-shebao]
url = "https://www.shebao.org/mcp"
```

#### 4. ChatGPT Custom GPT Actions
在 GPT 编辑器中点击 **Configure → Create new action**，在 **Import from URL** 填入：
```text
https://www.shebao.org/openapi.json
```
即可一键导入全量薪税社保测算接口。

---

### 方案二：本地 `stdio` 桥接脚手架

针对部分只支持 `stdio` 标准输入输出的客户端（例如 Claude Desktop），在 `claude_desktop_config.json` 中配置：

```json
{
  "mcpServers": {
    "china-shebao": {
      "command": "npx",
      "args": ["-y", "github:ddter/china-shebao-mcp"]
    }
  }
}
```

---

## 提供的 6 大核心测算工具 (Tools)

| 工具名称 | 功能说明 | 核心输入参数 |
| :--- | :--- | :--- |
| `query_social_security_policy` | 查询 31 省市 2026 官方社保基数上限、下限、社平工资及发文依据 | `province`（省份名） |
| `get_city_social_fund_limits` | 查询全国 392 城五险一金基数上下限、默认缴存比例及官方核验状态 | `city`（城市名或拼音 slug） |
| `calculate_salary_take_home` | 测算月薪/年薪税后到手工资、五险一金明细、累计预扣个税及 12 个月现金流分布 | `city`, `salary`, `fundRate`, `specialDeduction` |
| `calculate_income_tax` | 工资薪金累计预扣、劳务报酬按次预扣、年度综合所得汇算清缴 | `type`, `amount`, `month`, `annualLabor` |
| `compare_annual_bonus_tax` | 对比年终奖单独计税与合并计税两种方案的个税差异与到手金额，提供最优筹划建议 | `annualSalary`, `bonus` |
| `calculate_retirement_pension` | 企业职工基本养老保险退休金测算（月基础养老金 + 个人账户养老金） | `pensionBase`, `years`, `accountBalance`, `retireAge` |

---

## 示例对话场景 (Example Prompts)

- **场景 1（查政策）**：“帮我查一下 2026 年北京最新的社保缴费基数上下限和官方发文依据。”
- **场景 2（算到手）**：“我在上海月薪 15,000 元，公积金缴 7%，每月专项附加扣除 1,500 元，税后能拿到手多少？五险一金公司和个人各交多少？”
- **场景 3（年终奖筹划）**：“全年工资 18 万，年底发 5 万元年终奖，应该单独计税还是并入综合所得更划算？能帮我算出税额差异吗？”
- **场景 4（养老金退休试算）**：“计发基数 8,000 元，累计工龄 25 年，个人账户累计 12 万元，60 岁退休每月能领多少养老金？”

---

## 数据准确性与合规说明

1. **官方核验覆盖**：全国 392 个城市的社保缴费基数上下限均已与各省人社厅、医保局 2026 年度最新政策文件逐条核验，数据来源清晰可溯源至政府门户网站（`*.gov.cn`）。
2. **公积金核验透明度**：重点城市公积金基数与默认缴存比例已核验官方通知，未核验城市统一采用推荐比例（5%）明确试算边界。
3. **隐私安全**：全站无状态计算，不存储、不上传任何个人姓名、证件号码或薪酬明细。
4. **免责声明**：测算结果仅供薪酬筹划与参考，实际扣缴与待遇发放以当地社保局、公积金中心及税务机关核定为准。

---

## 开源协议

本项目遵循 [MIT License](./LICENSE) 开源协议。
官方网站：[https://www.shebao.org/](https://www.shebao.org/)
