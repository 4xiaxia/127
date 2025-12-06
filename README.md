项目名称: 东里村智能导游系统 (village-guide-ai-system)项目性质: 公益扶贫乡村AI导览系统技术定位: 基于ANP协议的智能代理通信架构目标用户: 乡村游客、文旅管理者、当地商户
🎯 核心业务需求
1. 智能导览服务
AI问答导览: 基于大模型的智能问答系统
语音交互: 支持语音提问和语音播报
图像识别: 景点打卡拍照，生成打卡书签（带书签唯一生成的二维码） ，生成成功=打卡成功
地图导航: 集成高德地图的导航功能
个性化推荐: 根据用户兴趣推荐内容
2. 内容管理需求
村子介绍: 文字简介
景点信息: 红色景点、风景名胜的详细介绍
东里名人：革命先辈|名人乡贤|青年学生  当地历史名人列表-人物的生平介绍、语AI音导读, 听导读听完=打卡成功  生成打卡成功精美的书签  （带书签唯一生成的二维码）
自媒体视频号: 这两个是文章推文列表
活动打卡: 这两个是文章推文列表



## 此项目为演示版本，甲方支持使用硬编码，无需担心安全问题，项目以落地为主。
## 开发环境：中国大陆用户优先考虑使用国内镜像源，如有需要可使用 cnpm 替代 npm 进行包管理。cdn·jsdelivr·net 提供的公共 CDN 可用于加速静态资源加载。

api地址： https://api.siliconflow.cn 
key：sk-xwmofaucrbykmzwwtbdwannjoxzxhssbwcfeafxykkdoouwe
模型使用：Qwen/Qwen3-8B
备选路线： https://open.bigmodel.cn/api/paas/v4/ 
key：a049afdafb1b41a0862cdc1d73d5d6eb.YuGYXVGRQEUILpog

minimax group ID :1918796298396373188
APIKEY: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJscyBsbGx5eXlzc3MiLCJVc2VyTmFtZSI6ImxzIGxsbHl5eXNzcyIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTE4Nzk2Mjk4NDAwNTY3NDkyIiwiUGhvbmUiOiIiLCJHcm91cElEIjoiMTkxODc5NjI5ODM5NjM3MzE4OCIsIlBhZ2VOYW1lIjoiIiwiTWFpbCI6ImxsbC55eXkuc3NzLjc3QGdtYWlsLmNvbSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTExLTIwIDE1OjUxOjQwIiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.Nvc6I_x53hQk_OSankcxU1uyb2Cek9-EhZoNO44mS1wsyiR2TNiof8FA9JmELCEBjnkomCCho1cxseEb098hAebTNklqRL5PlVl4rxaj4spAZt-1oloxojSSU3g-NoiurR-4dPcSMp43KOp0mc3Ci_piLylbxOG9H2WT3iN4Eaaj_558q7DgsbmpwLmpf3vOiy_j_qBEF5QztVN4gF8xhPasjXWAmT_hox7fmjTubn4PcQMbaAHKVBj95uP8l4VwbrjRpLaajyMIKHGoTS_0JAhmBH2psw49I2CouBNLggZGsOQS9XLepjX7euCtrMPJC7V0kPsUGJuxddLnYLrzJw

webhook:
 https://api.day.app/p2CPtgzAMNGQCqQYEz86AV/{{时间-日期}}-{{API服务商-型号-异常}}

高德    <script src="https://webapi.amap.com/maps?v=2.0&key=8428614f111312a91d57c0651f63e743"></script>

## 全局总要求：
1、前端要求（antD移动版或者magicUI+SHADui必须使用组件 来拼装前端，不得自己造轮子 项目全部能用CDN的全部使用cdn 减少自己编译的问题）
以下框架自己选一套使用
https://github.com/ant-design/agentic-ui/tree/main/docs
https://github.com/ant-design/ant-design/blob/master/README-zh_CN.md
https://magicui.design/docs/components
https://github.com/shadcn-ui/ui

2、除了使用脚手架组件之外，非必要绝对不引入任何新的库、函数、等，引入必须说明为什么


3、严格必须项目体现ANP多智能体协作（核心重点，去掉DID,专注信息共享、通信、与ANP2MCP调用各种现成工具）


4、军工级ANP多智能体协作系统：剃刀原则，第一性原理 做事前先严格写出要做什么，已完成什么，接下来目标做什么，不得无记录。
5、数据库结构、字段、agent的通信传递与节奏，逻辑为核心！必须有说明文件，必须有明确清晰的开发思路
6、演示版支持硬编码
7、所有能用现成的，如高德地图，绝对不自己造轮子！做功能前先动脑子思考有没有可以现成使用的（mcp市场搜索引擎先搜！没有再做）


2. AI对话服务
选择: 硅基流动API (现成服务)

// 不使用MCP工具，直接调用AI API
const AI_SERVICES = {
  primary: "https://api.siliconflow.cn/v1/chat/completions",
  backup: "https://api.zhipuai.cn/api/paas/v4/chat/completions"
};
理由:

✅ 专业AI服务提供商
✅ 支持多种模型
✅ 价格合理，性能稳定
✅ 标准OpenAI接口
3. 数据存储
选择: 浏览器原生存储 (现成API)

// 使用浏览器原生存储，无需MCP工具
const STORAGE_APIS = {
  localStorage: window.localStorage,
  indexedDB: window.indexedDB,
  sessionStorage: window.sessionStorage
};
理由:

✅ 浏览器原生支持
✅ 无需额外依赖
✅ 性能最优
✅ 离线可用

核心anp多智能体协作系统设计说明

https://github.com/agent-network-protocol/AgentNetworkProtocol
https://github.com/agent-network-protocol/anp-agent-example

https://github.com/agent-network-protocol/mcp2anp