def create_plan(user_request):
    print("\n========== Execution Plan ==========\n")

    plan = [
        "Analyze the repository structure",
        "Find Note model",
        "Find Note controller",
        "Find Note routes",
        "Identify changes required",
        "Modify the codebase",
        "Verify existing functionality",
        "Generate summary"
    ]

    print(f"User Request: {user_request}\n")

    for i, step in enumerate(plan, start=1):
        print(f"{i}. {step}")

    return plan