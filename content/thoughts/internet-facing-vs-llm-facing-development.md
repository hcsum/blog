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
