# Research ledger - 2026-09-15

Primary/current sources consulted for failure classes and interface design:

- GitHub REST Git database docs: raw blobs, trees, commits and refs can be created/read through API; branch ref update is the final state-moving step. https://docs.github.com/en/rest/git
- GitHub tree API: a changed tree must be committed and then a branch reference updated; write permission is required. https://docs.github.com/en/rest/git/trees
- OpenAI, "Designing AI agents to resist prompt injection" (2026-03-11): external content can act as a source of manipulation; constrain dangerous sinks and require safeguards/confirmation rather than trusting filtering alone. https://openai.com/index/designing-agents-to-resist-prompt-injection/
- OpenAI, "Understanding prompt injections" (2025-11-07): keep user control for consequential actions and minimize unnecessary access. https://openai.com/index/prompt-injections/
- Microsoft Agent Framework HITL/checkpoint docs (updated 2026-08): workflows use explicit request/response control for human-in-the-loop, and checkpoint state includes pending requests/responses for resumability. https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop and https://learn.microsoft.com/it-it/agent-framework/workflows/checkpoints
- Anthropic prompting best practices (current 2026 docs): explicit tool/action boundaries and minimum necessary complexity are preferable to blanket proactive action or unnecessary abstractions. https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables

These sources inform threat/failure classes; they do not grant runtime authority or certify iKant_LE.
