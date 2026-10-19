---
sidebar_position: 11
slug: /safety-ethics-and-compliance
---

# Chapter 10 — Safety, Ethics, and Compliance

**Exam domain: Safety, Ethics, and Compliance — 5%**

## Purpose

Learn to manage harmful outputs, bias, privacy, security, and governance throughout the LLM lifecycle—not only at the final API call.

## Learning objectives

- Identify common LLM risk categories and threat paths.
- Design layered guardrails and evaluate their effectiveness.
- Explain bias/fairness assessment limits.
- Apply privacy, access-control, and audit principles.
- Connect system controls to policies and incident response.

---

## 1. Safety is lifecycle work
Responsible deployment begins with use-case boundaries, data governance, access controls, threat modeling, evaluation, monitoring, and incident response. Output filtering alone cannot repair unsafe training data, over-broad permissions, prompt injection exposure, or a harmful product objective.

## 2. Common risks
Relevant risk classes include hallucinations and misinformation, discrimination and unfair treatment, privacy leakage, intellectual-property/licensing concerns, harmful-content generation, prompt injection, data exfiltration through tools/RAG, insecure output handling, model misuse, and overreliance by users.

Map each risk to a concrete harm, affected party, control, test, owner, and escalation path. “Be safe” is not a testable requirement.

## 3. Defense in depth
Use layered controls: authenticated access, least-privilege tools, trusted-data boundaries, input screening, retrieval filtering, instruction hierarchy, output validation/moderation, rate limiting, audit logs, human review for high-impact actions, and monitoring. Controls should fail safely: if a policy checker or retrieval step is unavailable, choose an appropriate restricted behavior.

## 4. Bias and fairness
Bias evaluation requires a defined context and affected groups. Measure relevant disparities, inspect representative examples, involve domain expertise, and document limitations. A single benchmark score does not prove a system is fair in every context.

## 5. Guardrails must be evaluated
Evaluate compliance rate, false positives, false negatives, latency/cost impact, bypass resistance, and usability. Test ordinary, borderline, adversarial, multilingual, and indirect-injection inputs. Review changes to guardrail policy just as carefully as changes to the base model.

## Mini-lab
Threat-model an internal RAG assistant with document search and a ticket-creation tool. Identify assets, trust boundaries, two prompt-injection paths, two data-leakage paths, and controls at retrieval, tool authorization, and output stages.

## Study checkpoint
- I can distinguish safety, security, privacy, and fairness risks.
- I can describe a layered rather than single-filter defense.
- I can explain why guardrails need their own evaluation suite.
- I can create a testable policy statement and an associated metric.


---

## Further learning resources

### Reading and documentation

1. [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
2. [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
3. [NVIDIA NeMo Guardrails documentation](https://docs.nvidia.com/nemo/guardrails/latest/)
4. [NVIDIA Guardrails evaluation guide](https://docs.nvidia.com/nemo/guardrails/evaluation/evaluate-configuration)
5. [Responsible AI Practices](https://www.microsoft.com/en-us/ai/responsible-ai)

### Videos

- [NVIDIA NeMo Guardrails search](https://www.youtube.com/results?search_query=NVIDIA+NeMo+Guardrails+tutorial)
- [OWASP LLM security search](https://www.youtube.com/results?search_query=OWASP+Top+10+LLM+applications)
- [NIST AI RMF search](https://www.youtube.com/results?search_query=NIST+AI+Risk+Management+Framework+explained)

## Suggested study rhythm

Spend one focused session learning the concepts, a second session doing the mini-lab, and a third session explaining the checkpoint items without notes. Do not advance simply because the vocabulary is familiar; advance when you can select a method, state its tradeoff, and diagnose a realistic failure case.
