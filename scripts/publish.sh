#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo='az9713/beyond-waterbottle-CG-physics'
remote="https://github.com/$repo.git"
gh auth status
if [[ ! -d .git ]]; then git init -b main; fi
if ! gh repo view "$repo" --json name >/dev/null 2>&1; then
  gh repo create "$repo" --public --description 'Interactive physics: water bottle CG, realistic effects, and universal weighted averages'
fi
if existing=$(git remote get-url origin 2>/dev/null); then
  if [[ "$existing" != "$remote" && "$existing" != "git@github.com:$repo.git" ]]; then
    echo "Origin points to a different repository: $existing" >&2; exit 1
  fi
else git remote add origin "$remote"; fi
[[ $(git branch --show-current) == main ]] || { echo 'Run on main.' >&2; exit 1; }
git add --all
if ! git diff --cached --quiet; then git commit -m 'Build six-tab interactive center-of-gravity physics explorer'; fi
gh auth setup-git
git push -u origin main
body=$(mktemp)
trap 'rm -f "$body"' EXIT
printf '%s\n' '{"source":{"branch":"main","path":"/"},"build_type":"legacy"}' > "$body"
if gh api "repos/$repo/pages" >/dev/null 2>&1; then method=PUT; else method=POST; fi
gh api --method "$method" "repos/$repo/pages" --input "$body"
gh api "repos/$repo/pages" --jq '{url:.html_url,status:.status}'
echo 'Push completed. Pages may take a few minutes to finish its build.'
