import os
from parser import extract_json


def save_response(response, output_file="gemini_response.md"):
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(response)

    print(f"\n✅ Gemini response saved to {output_file}")


def apply_changes(repo_path, response):

    try:
        data = extract_json(response)

    except Exception as e:
        print("\nInvalid Gemini Response")
        print(e)
        return

    print("\n========== Applying Changes ==========\n")

    for file in data["files"]:

        file_path = os.path.join(repo_path, file["path"])

        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(file["content"])

        print("Updated:", file["path"])

    print("\n========== Summary ==========\n")
    print(data["summary"])