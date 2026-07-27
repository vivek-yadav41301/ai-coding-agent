from explorer import explore_repository
from planner import create_plan
from reader import read_repository
from llm import ask_llm
from writer import save_response, apply_changes

REPO_PATH = "./node-easy-notes-app"

def main():

    print("=" * 60)
    print("AI Coding Agent")
    print("=" * 60)

    # Get request from the user
    user_request = input("\nEnter your request: ").strip()

    if not user_request:
        print("No request provided. Exiting...")
        return

    # Step 1: Explore Repository
    explore_repository(REPO_PATH)

    # Step 2: Create Execution Plan
    create_plan(user_request)

    # Step 3: Read Repository
    print("\n========== Reading Repository ==========\n")

    files = read_repository(REPO_PATH)

    for path in files:
        print("✓", path)

    print(f"\nTotal Files Loaded: {len(files)}")

    # Step 4: Prepare Context
    print("\nSending repository to Gemini...\n")

    context = ""

    for path, code in files.items():
        context += f"\nFILE: {path}\n"
        context += code
        context += "\n\n"

    # Step 5: Ask Gemini
    response = ask_llm(user_request, context)

    print("\n========== Gemini Response ==========\n")
    print(response)

    # Step 6: Save and Apply Changes
    save_response(response)
    apply_changes(REPO_PATH, response)


if __name__ == "__main__":
    main()