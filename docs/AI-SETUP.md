# StudyOS Assistant — development preview

Open Assistant in the Windows desktop app. Connect using Continue with ChatGPT, authorize StudyOS in the official browser flow, then load your account's models. Eligible plan access and workspace policies apply.

Alternatively, add your own Gemini API key from Google AI Studio. Use a free-tier project with billing disabled to avoid charges. StudyOS cannot verify billing configuration. Gemini 3.5 Flash-Lite is used; quotas, regional availability and free-tier data-use terms apply. No automatic provider switch or billing upgrade occurs.

Enter a topic, goal, start date, day count and daily time budget. Review the exact data preview and consent before requesting a plan. PDFs, existing tasks and study history are not sent. Tasks are editable, validated, and persisted only after confirmation. Assign start times later in Planner.

Credentials stay in the native backend and are encrypted with Windows DPAPI in `ai-credentials.dpapi` under the app data directory. They are excluded from study-state exports and browser storage. Removing a local connection does not revoke its upstream grant; manage it in ChatGPT usage settings.

Live sign-in and generation require the user's authorization and quota and remain a separate end-to-end check. See the [Turkish guide](AI-SETUP.tr.md) for step-by-step instructions.

## v0.5.0 chat

Assistant offers Chat and Study plan modes. Use Connection and model to select your provider/model, consent to message sharing, then send with Enter or the Send button. Shift+Enter inserts a newline. Up to 19 recent messages are sent within a byte budget. History is session-only and cleared on New chat, provider/connection changes or app exit. No automatic document access, web browsing or task mutation is offered. Settings is now a top-right button.
