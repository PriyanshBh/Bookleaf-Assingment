# AI Integration

## Model and client

The server uses `@google/genai`, `gemini-2.5-flash`, and API `v1beta`. The beta endpoint is required for this model's system instructions and structured response behavior in the installed SDK. No AI code or credential enters a client bundle.

## Classification and priority

`classifyTicket()` sends only subject and description, delimited as untrusted ticket content. A system instruction defines the BookLeaf triage role, exact six-category taxonomy, severity principles, and prompt-injection boundary. One call returns:

```json
{ "category": "ISBN & Metadata Issues", "priority": "High", "reason": "..." }
```

Gemini JSON Schema constrains the response and Zod validates it again. The call uses temperature 0.1, thinking budget 0, and a 500-token ceiling. New tickets are saved before the call. Missing credentials, timeout, quota, network, or parse errors leave safe `General Inquiry` / `Medium` fallback values and set an explicit AI processing state.

## Draft generation

The prompt contains:

- BookLeaf support role and communication rules
- only the selected topical policy section
- author name and minimized book/publication/royalty facts
- ticket subject/description and up to eight recent public messages
- explicit restrictions against invented actions, unsupported timelines, blame, or internal notes

The response schema contains one `draft` string. The admin can edit, regenerate, discard, or explicitly send it. AI output is never auto-sent.

## Knowledge retrieval

`src/knowledge-base/bookleaf.ts` maps each category to one policy section. This deterministic retrieval avoids a vector database and prevents sending unrelated policies. It also keeps prompts and cost small.

## Reliability and cost

- 15-second application timeout
- admin/user rate limits for expensive calls
- bounded conversation context and field lengths
- one call for classification + priority
- no AI calls during render or polling
- total token usage stored when the provider returns it
- deterministic structured calls disable thinking to prevent JSON truncation

## Verified behavior

On 2026-11-10, a real ticket about an incorrect Amazon subtitle was persisted, then Gemini classified it as `ISBN & Metadata Issues` / `High` and generated a 674-character draft addressed to Priya Sharma. A deliberately observed pre-fix API-version failure also demonstrated that ticket creation still completed with fallback metadata.
