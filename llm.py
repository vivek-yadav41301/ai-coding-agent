from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_llm(user_request, repository_context):

    prompt = f"""
You are an expert AI Coding Agent.

Repository Source Code:

{repository_context}


User Request:

{user_request}


Your job:

1. Understand the repository.
2. Decide the best implementation.
3. Preserve all existing functionality.
4. Modify only required files.

IMPORTANT

Return ONLY valid JSON.

Example:

{{
    "summary":"Added search and tags support",
    "files":[
        {{
            "path":"app/models/note.model.js",
            "content":"FULL FILE CONTENT"
        }},
        {{
            "path":"app/controllers/note.controller.js",
            "content":"FULL FILE CONTENT"
        }}
    ]
}}

Rules

- Do NOT return markdown.
- Do NOT use ``` blocks.
- Return COMPLETE file contents.
- Return ONLY JSON.
"""

    try:

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        return response.text

    except Exception as e:

        return f"Gemini Error : {e}"


if __name__ == "__main__":

    print("API Key Loaded:", os.getenv("GEMINI_API_KEY") is not None)

    print("\nAvailable Models\n")

    try:

        for model in client.models.list():
            print(model.name)

    except Exception as e:

        print(e)