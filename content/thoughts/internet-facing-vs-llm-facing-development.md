# 🧠 What Should LLM-Facing Developers Know?

> If building for the internet was the mainstream in the past 20 years, building for LLMs might be the future.

Just like how web developers don't need to know the low-level implementation of TCP/IP but understand request/response and protocols like HTTPS, developers building on top of LLMs in the future might not need to know model internals—but they should know how to interact with LLMs effectively.

## 📦 As an LLM Developer, Here's What You Should Know

### 1. Interaction Patterns: Prompt → Completion / Chat

- Understand how LLMs receive input and return output (prompts and responses)
- Learn how to call common LLM APIs (OpenAI, Claude, Mistral, local models)
- Know about token limits, context windows—similar to request size limits
- Prompt Engineering = crafting good requests (like HTTP headers + body)
- Learn function calling and tool use—just like defining APIs for the model to call

### 2. Conversation State & Memory

Similar to Sessions/Cookies in web:

- Manage conversation history
- Use embeddings for memory or long-term context
- Handle short-term vs long-term memory tradeoffs

### 3. Security, Cost, and Performance

- Be aware of Prompt Injection, the new "SQL injection"
- Control token usage to manage costs
- Stream outputs, cache results, and reuse context to optimize performance

### 4. LLM Capabilities and Limitations

Know what LLMs are good at:

- Text generation, summarization, question answering, parsing

And what they're not good at:

- Accurate calculations, strict logic, complex planning

> LLMs are not databases, rule engines, or reasoning machines—they are probabilistic language models.

### 5. RAG and Agent Architectures

- Understand RAG (Retrieval-Augmented Generation):
  - Chunking, embedding, vector search
- Learn the basics of agent-style systems:
  - Multi-step reasoning, tool use, task planning
  - Frameworks: LangChain, AutoGPT, ReAct

### 6. Structured Output and Parsing

- Prompt models to output in JSON/YAML/Markdown
- Use parsers or schema validators (zod, pydantic) to handle output safely

## 🧩 Advanced (Optional) Knowledge

- Basic understanding of how models work (Transformers, attention mechanisms)
- Learn how embeddings work and how to compute similarity (cosine, dot product)
- Study prompt patterns: Chain-of-Thought, Few-shot, ReAct
- Know key open-source models (LLaMA, Mistral, GPT series) and how to choose between them
- Try deploying local models (Ollama, LM Studio, llama.cpp) for testing and dev

# 互联网开发者 vs LLM开发者：类比与知识体系

互联网开发者并不需要掌握网络协议的全部实现细节，但需要理解它的基本工作方式、模式和限制；同理，未来如果LLM成为基础设施级别的技术，开发者也许需要掌握"面向LLM开发"的基本理念和接口，而不必掌握模型的底层实现。

## 🧠 面向 LLM 的开发者需要了解的知识

### 1. LLM 的「协议」与「调用模式」

- 理解 LLM 的输入输出模式（Prompt → Completion / Chat）
- 熟悉常用的 API 调用方式（如 OpenAI, Claude, Mistral, local 模型等）
- 了解上下文窗口大小、token 概念，类似于请求包大小的限制
- 掌握构建提示语的技巧（Prompt Engineering），就像构造 HTTP 请求头和 Body
- 理解函数调用 / Tool calling / 插件机制，相当于为 LLM 定义"API接口"

### 2. 对话状态与记忆管理

类似 Session/Cookie 的机制，LLM 中也需要维护上下文，使用：

- Conversation history
- Embedding-based memory
- 长期记忆 vs 短期记忆 的划分与使用策略

### 3. 安全、性能与成本

- 理解 prompt injection（相当于 SQL 注入）
- 限制 token 使用，控制成本
- 使用流式输出、缓存重复调用等手段优化性能

### 4. LLM 的能力边界与行为模型

- 哪些任务适合 LLM（生成、摘要、对话、理解、结构化输出等）
- 哪些任务不适合（精确计算、严格逻辑推理、多步复杂规划）
- LLM 并不是数据库、规则引擎、图形引擎——了解它是一个概率语言模型

### 5. RAG 与 Agent 架构

- 理解 RAG（Retrieval-Augmented Generation）：
  - 如何结合知识库、embedding、搜索
  - chunking、向量搜索的策略
- 初步了解 Agent 架构：
  - 多轮决策、工具使用、规划与执行
  - LangChain, AutoGPT, ReAct 等 agent 框架的基本思想

### 6. 结构化输出与解析

- 使用格式化提示输出 JSON/YAML/Markdown 等
- 搭配 parser、schema 校验器（如 zod, pydantic）进行结构化理解

## 🧩 进阶开发者可以了解的部分

- 简要了解模型结构（transformer 机制、注意力机制、finetune vs pretrain）
- 理解 embedding 的意义和相似度度量（cosine, dot product）
- 基础的 prompt 设计模式（如 Chain-of-Thought, Few-shot, ReAct）
- 熟悉常用开放模型（LLaMA, Mistral, Claude, GPT 系列）的优劣和选型建议
- 部署本地模型（如 Ollama, LM Studio, llama.cpp）用于开发和测试1
