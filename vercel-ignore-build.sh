#!/bin/bash

# Only deploy from main branch
if [[ "$VERCEL_GIT_COMMIT_REF" != "main" ]] ; then
  echo "🚫 Not main branch - skipping production deploy"
  exit 0
fi

echo "✅ Main branch - proceeding with deploy"
exit 1
