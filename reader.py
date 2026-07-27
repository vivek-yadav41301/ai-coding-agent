import os

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__"
}


def read_repository(repo_path):

    repository_context = {}

    for root, dirs, files in os.walk(repo_path):

        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:

            if file.endswith(".js") or file == "package.json":

                path = os.path.join(root, file)

                try:

                    with open(path, "r", encoding="utf-8") as f:

                        repository_context[path] = f.read()

                except Exception as e:

                    print(e)

    return repository_context


# hardcoded

# import os

# TARGET_FILES = [
#     "note.model.js",
#     "note.controller.js",
#     "note.routes.js",
#     "server.js",
#     "package.json"
# ]


# def read_repository(repo_path):
#     repository_context = {}

#     for root, dirs, files in os.walk(repo_path):

#         dirs[:] = [d for d in dirs if d not in ("node_modules", ".git")]

#         for file in files:

#             if file in TARGET_FILES:

#                 path = os.path.join(root, file)

#                 try:
#                     with open(path, "r", encoding="utf-8") as f:
#                         repository_context[path] = f.read()
#                 except Exception as e:
#                     print(f"Error reading {path}: {e}")

#     return repository_context