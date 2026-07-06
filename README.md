clone it

cd `frontend` run `npm start`

open another Terminal

cd `backend` run `uvicorn main:app --reload --port 8000`

## Model configuration

The backend uses `OPENAI_API_KEY` first. If `OPENAI_API_KEY` is not set, it uses Azure OpenAI with these Azure Web App application settings:

```text
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_VERSION=...
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

For non-Azure OpenAI, optionally set `OPENAI_MODEL`; otherwise the backend uses `gpt-4o`.
