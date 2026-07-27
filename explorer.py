import os

IMPORTANT_FILES = ["package.json", "README.md"]

IMPORTANT_DIRS = ["app", "controllers", "routes", "models", "config", "src"]

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__"
}

def explore_repository(repo_path):
    print("\n========== Repository Explorer ==========\n")

    found_files = []
    found_dirs = []

    for root, dirs, files in os.walk(repo_path):

        # Ignore unwanted folders
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            if file in IMPORTANT_FILES:
                found_files.append(os.path.join(root, file))

        for directory in dirs:
            if directory in IMPORTANT_DIRS:
                found_dirs.append(os.path.join(root, directory))

    print("Important Files:")
    for f in found_files:
        print("✓", f)

    print("\nImportant Directories:")
    for d in found_dirs:
        print("✓", d)

    return {
        "files": found_files,
        "directories": found_dirs
    }