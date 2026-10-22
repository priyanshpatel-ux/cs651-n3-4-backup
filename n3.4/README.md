# CS651 N3.4 — Smart Speech Coach on AWS Elastic Beanstalk

N3.4 deploys the Smart Speech Coach Express/Gemini backend from N3.3 to AWS Elastic Beanstalk.

## Deployed environment

- Application: `cs651-n3-4`
- Environment: `Cs651-n3-4-env`
- Region: `us-east-1`
- Platform: Node.js 22 on 64-bit Amazon Linux 2023
- Environment URL: `http://cs651-n3-4-env.eba-utvuhxhi.us-east-1.elasticbeanstalk.com`

## Backend endpoints

Health check:

```bash
curl http://cs651-n3-4-env.eba-utvuhxhi.us-east-1.elasticbeanstalk.com/api/health
```

Expected response:

```json
{"status":"ok"}
```

Gemini endpoint:

```bash
curl -X POST http://cs651-n3-4-env.eba-utvuhxhi.us-east-1.elasticbeanstalk.com/api/askanything \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Smart Speech Coach?"}'
```

Expected response: JSON containing an `answer` field.

## Deployment configuration

The backend is started by `backend/Procfile`:

```text
web: npm start
```

Configure these Elastic Beanstalk environment properties. Put the real Gemini key only in AWS; never commit it:

```text
GEMINI_API_KEY=<current-key>
geminiAskAnythingModel=gemini-2.5-flash
askAnythingPrompt=You are going to answer questions about Smart Speech Coach. Keep answers concise and on topic.
allowedOrigins=http://localhost:5173,https://smartspeechcoach.web.app
```

## Demo checklist

1. Show this `n3.4` folder in the shared repository.
2. Show `backend/server.js` and `backend/Procfile`.
3. Show the Elastic Beanstalk application and environment in `us-east-1`.
4. Show a healthy environment and hide the Gemini key.
5. Run the health request and the Gemini request above.
6. Do not commit `.env` files, AWS credentials, Gemini keys, `node_modules`, or ZIP build artifacts.

The class Elastic Beanstalk URL is HTTP. A Firebase HTTPS frontend cannot call it directly in a browser without an HTTPS proxy or load balancer, so N3.4 should demonstrate the backend endpoints directly unless the instructor requires frontend integration.
