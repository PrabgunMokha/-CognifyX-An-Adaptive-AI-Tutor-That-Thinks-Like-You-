# CognifyX - Adaptive AI Learning Assistant

An intelligent tutoring system built with FastAPI and Next.js, tailored to learn and adapt to user behavior.

## Project Structure
- `frontend/`: Next.js React application.
- `backend/`: FastAPI application handling AI processing.

## Local Development

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create a `.env` file and add `GEMINI_API_KEY=your_key_here` (or it will use mock data)
4. `uvicorn main:app --reload --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (API_URL defaults to `/api` which will be handled by next.config in dev or manually)

*(Note: For standalone running, ensure `NEXT_PUBLIC_API_URL` is set to `http://localhost:8000/api` in the frontend if running on a separate port).*

## Cloud Run Deployment Steps

The project is containerized using Docker, making it easy to deploy on Google Cloud Run.

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```

2. **Build and Submit the Image to Google Cloud Build:**
   ```bash
   gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/cognifyx .
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy cognifyx \
     --image gcr.io/[YOUR_PROJECT_ID]/cognifyx \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_api_key_here"
   ```

4. **Access your application:**
   Click the deployed URL provided by the Cloud Run CLI output!
