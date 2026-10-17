$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$repo = 'az9713/beyond-waterbottle-CG-physics'
$remote = "https://github.com/$repo.git"
function Check-Exit($operation) {
    if ($LASTEXITCODE -ne 0) { throw "$operation failed (exit $LASTEXITCODE)." }
}
gh auth status
Check-Exit 'GitHub authentication'
if (-not (Test-Path '.git')) {
    git init -b main
    Check-Exit 'Git initialization'
}
gh repo view $repo --json name *> $null
if ($LASTEXITCODE -ne 0) {
    gh repo create $repo --public --description 'Interactive physics: water bottle CG, realistic effects, and universal weighted averages'
    Check-Exit 'Repository creation'
}
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    if ($existing -ne $remote -and $existing -ne "git@github.com:$repo.git") {
        throw "Origin is $existing; refusing to replace a different repository remote."
    }
} else {
    git remote add origin $remote
    Check-Exit 'Remote creation'
}
$branch = git branch --show-current
if ($branch -ne 'main') { throw 'Run this publication script on the main branch.' }
git add --all
Check-Exit 'Staging'
git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    git commit -m 'Build six-tab interactive center-of-gravity physics explorer'
    Check-Exit 'Commit'
} elseif ($LASTEXITCODE -ne 0) { throw 'Unable to inspect staged changes.' }
gh auth setup-git
Check-Exit 'Git authentication setup'
git push -u origin main
Check-Exit 'Push (no force push attempted)'
$body = '{"source":{"branch":"main","path":"/"},"build_type":"legacy"}'
$temp = Join-Path ([IO.Path]::GetTempPath()) ('waterbottle-pages-' + [guid]::NewGuid() + '.json')
try {
    [IO.File]::WriteAllText($temp, $body, [Text.UTF8Encoding]::new($false))
    gh api "repos/$repo/pages" --jq '.html_url' 2>$null
    if ($LASTEXITCODE -eq 0) {
        gh api --method PUT "repos/$repo/pages" --input $temp
    } else {
        gh api --method POST "repos/$repo/pages" --input $temp
    }
    Check-Exit 'Pages configuration'
} finally { Remove-Item $temp -ErrorAction SilentlyContinue }
gh api "repos/$repo/pages" --jq '{url:.html_url,status:.status}'
Check-Exit 'Pages status'
Write-Host 'Push completed. Pages may take a few minutes to finish its build.'
