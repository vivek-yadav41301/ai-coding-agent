import json
import re


def extract_json(response: str):

    # Remove markdown code fences
    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    # Try direct JSON parsing
    try:
        return json.loads(response)
    except:
        pass

    # Extract first JSON object
    match = re.search(r"\{.*\}", response, re.DOTALL)

    if not match:
        raise Exception("No JSON found in Gemini response.")

    json_text = match.group(0)

    return json.loads(json_text)