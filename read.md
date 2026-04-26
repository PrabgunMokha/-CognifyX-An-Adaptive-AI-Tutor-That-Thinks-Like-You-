# CognifyX Project Guide

## What CognifyX is

CognifyX is an adaptive AI tutor dashboard. It is built to feel less like a plain chatbot and more like a guided learning workspace.

The app is designed around a few main ideas:
- teach differently when the learner is confused
- test confidence, not just correctness
- use roleplay and debate instead of passive reading
- revisit concepts through revision timing
- turn topics into structured concept maps and slide-style summaries

## Main features

### 1. Adaptive Studio
This module explains a topic in different styles.

It can:
- detect confusion from the learner's wording
- reframe the same topic using analogy, steps, example, or theory
- compress the topic into one memorable line
- suggest curiosity paths for what to learn next

### 2. Interview Prep
This module simulates an interview-style learning flow.

It can:
- give scenario-based questions
- adjust challenge level
- use confidence input to judge whether the learner is calibrated
- give short feedback after a response

### 3. Concept Mapper
This module turns a topic into structured learning material.

It can:
- identify concept areas
- show likely knowledge gaps
- generate a concept graph
- generate slide-style explanation cards

### 4. Debate Lab
This module tests whether the learner really understands the topic.

It can:
- challenge a claim with a counterexample
- ask a skeptical follow-up question
- let the learner write a defense
- review that defense and reveal the expected answer after submission

### 5. Revision Radar
This module checks knowledge and schedules review.

It can:
- ask a question for the chosen topic
- accept the learner's answer
- compare confidence with correctness
- label the learner as overconfident, underconfident, or calibrated
- add the topic to a revision queue

### 6. Login and Learner Setup
The app includes a basic onboarding screen.

Fields include:
- username
- email
- password
- school or university
- class

## Project structure

```text
CognifyX-cloudrun/
  backend/
    main.py
    requirements.txt
  frontend/
    out/
      index.html
      app.js
      styles.css
  Dockerfile
  .dockerignore
  README.md
  read.md
```

## How it works locally

The project has two parts:
- a FastAPI backend on port `8000`
- a static frontend on port `3000`

### Run backend

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Run frontend

```bash
cd frontend/out
python -m http.server 3000
```

### Open in browser

```text
http://127.0.0.1:3000
```

## What is required to make it work

You need:
- Python installed
- the backend dependencies installed from `requirements.txt`

Install backend dependencies with:

```bash
pip install -r requirements.txt
```

## Does it need a `.env` file?

No, not in the current version.

The current app is set up to work without the API key path being required. That means the Cloud Run folder does not need a `.env` file and should not leak your API key.

## How to deploy on Google Cloud Run

Upload the `CognifyX-cloudrun` folder, open Cloud Shell, and run:

```bash
cd ~/CognifyX-cloudrun
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy cognifyx --source . --platform managed --allow-unauthenticated --region us-central1
```

## Current behavior notes

- The frontend is served as a static app.
- The backend serves the learning logic and revision logic.
- Expected answers in revision and debate are shown after submission, not before.
- The app is currently optimized for reliability and demo stability.

## If the app does not work

Check these first:
- backend is running on `127.0.0.1:8000`
- frontend is running on `127.0.0.1:3000`
- no other process is blocking either port
- browser is opened at the right frontend URL

## Summary

CognifyX is a dashboard-based adaptive tutor with:
- adaptive explanation
- interview roleplay
- concept mapping
- debate-based learning
- revision tracking
- confidence analysis

It is meant to be simple to run, simple to demo, and safe to move to another machine.
