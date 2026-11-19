#!/usr/bin/env bash
# Security-hardening runner: one headless claude worker per task, sequential, resumable.
# A task is done when a commit with subject "sec-NN:" exists. Re-run to resume.
#
#   tasks/sec/run.sh               run all remaining tasks
#   ONLY=03 tasks/sec/run.sh       run just that task
#   MODEL=opus EFFORT=high ...     override model/effort (stuck task)
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

D=tasks/sec
RUNS=$D/runs
GATE=${GATE:-"npx vitest run && npx eslint --ext .ts,.js,.cjs,.vue . && npx nuxi build"}
# Team accounts first (weekly reset Wed 07:00), personal only with PERSONAL=1 (reset Thu 03:00).
ACCOUNTS=("$HOME/.claude-kodart-admin" "$HOME/.claude-kodart-nesim")
[ -n "${PERSONAL:-}" ] && ACCOUNTS+=("default")
mkdir -p "$RUNS"

say() { printf '\n[sec %s] %s\n' "$(date +%H:%M:%S)" "$*" | tee -a "$RUNS/status.txt"; }
is_done() { [ -n "$(git log -1 --format=%s --grep="^sec-$1:")" ]; }
gate() { bash -c "$GATE"; }

if [ "$(git branch --show-current)" != "security-hardening" ]; then
  git switch security-hardening || exit 1
fi

if ! is_done 00; then
  grep -qx "/$RUNS/" .gitignore || echo "/$RUNS/" >>.gitignore
  git add -A && git commit -qm "sec-00: docs audit, plan, task specs, runner" || exit 1
  say "committed sec-00"
fi

if [ ! -e "$RUNS/baseline.ok" ]; then
  say "baseline gate"
  gate >"$RUNS/baseline.txt" 2>&1 || { say "baseline RED, see $RUNS/baseline.txt"; exit 1; }
  touch "$RUNS/baseline.ok"
fi

# Narrow allowlist: edits + project test/lint/build/npm commands + read-only git.
PERMS=(--permission-mode acceptEdits --allowedTools
  "Read" "Edit" "Write" "Glob" "Grep"
  "Bash(npx vitest:*)" "Bash(npx eslint:*)" "Bash(npx nuxi build)" "Bash(npx nuxi typecheck)" "Bash(npx nuxi prepare)"
  "Bash(npm i:*)" "Bash(npm install:*)" "Bash(npm uninstall:*)" "Bash(npm audit:*)" "Bash(npm ls:*)"
  "Bash(git status:*)" "Bash(git diff:*)" "Bash(git log:*)" "Bash(git ls-files:*)" "Bash(git rm:*)"
  "Bash(ls:*)" "Bash(wc:*)" "Bash(cat:*)")

worker() {
  local acct=$1 model=$2 effort=$3 out=$4 prompt=$5
  shift 5
  if [ "$acct" = default ]; then
    claude -p "$prompt" --model "$model" --effort "$effort" "${PERMS[@]}" "$@" </dev/null >"$out" 2>&1
  else
    CLAUDE_CONFIG_DIR=$acct claude -p "$prompt" --model "$model" --effort "$effort" "${PERMS[@]}" "$@" </dev/null >"$out" 2>&1
  fi
}

run_task() {
  local id=$1 model=${MODEL:-$2} effort=${EFFORT:-$3} title=$4
  local prompt="You are implementing task $id ($title) of the Whispeer security hardening. Read tasks/sec/DESIGN.md fully, then section '## $id' of tasks/sec/TASKS.md, and do exactly that task. The working tree may contain partial work from an interrupted run of this same task: run git status and git diff first and continue from it. TDD: failing tests first. Finish only when this gate is green: $GATE. Do not commit."
  local acct name out
  for acct in "${ACCOUNTS[@]}"; do
    name=$(basename "$acct")
    out="$RUNS/$id-$name-$(date +%m%d-%H%M%S).txt"
    say "task $id ($title) → $name, $model/$effort"
    if ! worker "$acct" "$model" "$effort" "$out" "$prompt"; then
      if grep -Eiq 'usage limit|hit your limit|limit reached|out of extra usage' "$out"; then
        say "task $id: $name out of quota → next account"
      else
        say "task $id: $name worker failed (see $out) → next account"
      fi
      continue
    fi
    if ! gate >"$RUNS/$id-gate.txt" 2>&1; then
      say "task $id: gate red, one retry on $name"
      worker "$acct" "$model" "$effort" "$out.retry" "The gate is failing after your work on task $id. Fix it; do not weaken or delete tests. Failure tail:
$(tail -n 80 "$RUNS/$id-gate.txt")" --continue || continue
      gate >"$RUNS/$id-gate.txt" 2>&1 || {
        say "task $id: STILL RED after retry. Tree left as is. See $RUNS/$id-gate.txt"
        return 2
      }
    fi
    git add -A && git commit -qm "sec-$id: $title" || { say "task $id: nothing to commit?"; return 2; }
    say "task $id DONE ($name)"
    return 0
  done
  say "task $id: all accounts failed or out of quota. Team resets Wed 07:00. Re-run to resume (PERSONAL=1 to add personal)."
  return 3
}

while IFS=$'\t' read -r id model effort title <&3; do
  [ -n "${ONLY:-}" ] && [ "$ONLY" != "$id" ] && continue
  is_done "$id" && continue
  if [ "$id" = 05 ] && [ ! -e "$D/REVIEW.md" ]; then
    say "tasks 01-04 done. Waiting for Fable review → $D/REVIEW.md, then re-run."
    exit 0
  fi
  run_task "$id" "$model" "$effort" "$title" || exit $?
done 3<"$D/tasks.tsv"
say "all tasks done."
