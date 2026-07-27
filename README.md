# AI Coding Agent

## Overview

This project implements an AI Coding Agent in **Python 3.11** that automatically understands an existing Node.js repository and implements a product request with minimal user guidance.

The target repository is:

* **callicoder/node-easy-notes-app**

User Request:

> Improve the application so users can better organise and search their notes.

The agent explores the repository, identifies the relevant files, generates an execution plan, sends the repository context to Gemini, applies the generated code changes automatically, and summarizes the implementation.

---

# Architecture

```
                User Request
                      |
                      v
               AI Coding Agent
                      |
        +-------------+-------------+
        |                           |
        v                           v
 Repository Explorer          Execution Planner
        |                           |
        +-------------+-------------+
                      |
                      v
                Gemini API
                      |
                      v
               Code Generator
                      |
                      v
               File Updater
                      |
                      v
             Change Summary
```

---

# Agent Workflow

1. Accept the user's request.
2. Explore the repository automatically.
3. Detect important files and directories.
4. Read the relevant source code.
5. Generate an execution plan.
6. Send repository context to Gemini.
7. Receive updated code.
8. Apply modifications to the repository.
9. Generate a summary of all changes.

---

# Repository Exploration

The agent automatically scans the repository and identifies important files including:

* package.json
* server.js
* app/models/note.model.js
* app/controllers/note.controller.js
* app/routes/note.routes.js
* config/database.config.js

Only relevant files are sent to the LLM, reducing unnecessary context and improving response quality.

---

# Features Added

The AI agent enhanced the Notes application by implementing:

* Tags support
* Categories
* Improved search
* Filtering
* Sorting
* Pin notes
* Archive notes
* Favorite notes
* Color support
* Statistics endpoint
* PATCH API support
* MongoDB indexes for faster searching

---

# Assumptions

* The existing project structure remains unchanged.
* The application continues using MongoDB.
* Existing APIs should remain compatible.
* Only features related to note organization and search are implemented.

---

# Trade-offs

* The agent modifies only the files relevant to the requested feature.
* Repository understanding is based on static code analysis.
* The generated implementation depends on the LLM response quality.

---

# Technologies Used

* Python 3.11
* Google Gemini API
* Node.js
* Express.js
* MongoDB
* Mongoose

---

# Running the Agent

```bash
python agent.py
```

The agent will:

* Explore the repository
* Generate an execution plan
* Request code generation from Gemini
* Apply changes automatically
* Print a final summary

---

# Output

The modified Node.js application now supports better note organization and searching while preserving the original functionality.
