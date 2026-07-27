#!/bin/bash

# Color codes for clean reporting
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0;37m' 
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}=====================================================${NC}"
echo -e "${BLUE}${BOLD}          OITS Dhaka — Agro ERP Monorepo CI/CD        ${NC}"
echo -e "${BLUE}${BOLD}=====================================================${NC}"

# Detect changes
CHANGED_UTILS=false
CHANGED_UI=false
CHANGED_APP=false

# If package name is provided as an argument, force change detection
if [ ! -z "$1" ]; then
  echo -e "${YELLOW}Target package override specified: $1${NC}"
  if [ "$1" == "utils" ] || [ "$1" == "@agro-erp/shared-utils" ]; then
    CHANGED_UTILS=true
  elif [ "$1" == "ui" ] || [ "$1" == "@agro-erp/shared-ui" ]; then
    CHANGED_UI=true
  elif [ "$1" == "app" ] || [ "$1" == "@agro-erp/app" ]; then
    CHANGED_APP=true
  else
    echo -e "${RED}Unknown package: $1. Available packages: utils, ui, app.${NC}"
    exit 1
  fi
else
  # Auto-detection using git
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo -e "Detecting changed packages via Git diff..."
    # Check for changes against HEAD or local modifications
    CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || git status --porcelain | awk '{print $2}')
    
    if [ -z "$CHANGED_FILES" ]; then
      echo -e "${GREEN}No changes detected. Running full pipeline as fallback...${NC}"
      CHANGED_UTILS=true
      CHANGED_UI=true
      CHANGED_APP=true
    else
      echo -e "Files changed:"
      echo "$CHANGED_FILES" | sed 's/^/  - /'
      
      if echo "$CHANGED_FILES" | grep -q "packages/shared-utils/"; then
        CHANGED_UTILS=true
      fi
      if echo "$CHANGED_FILES" | grep -q "packages/shared-ui/"; then
        CHANGED_UI=true
      fi
      if echo "$CHANGED_FILES" | grep -q "packages/app/"; then
        CHANGED_APP=true
      fi
    fi
  else
    echo -e "${YELLOW}Not in a Git repository. Running full pipeline for all packages...${NC}"
    CHANGED_UTILS=true
    CHANGED_UI=true
    CHANGED_APP=true
  fi
fi

# Summary of target packages to build & test
echo -e "\n${BOLD}Selective Pipeline Execution Matrix:${NC}"
if [ "$CHANGED_UTILS" = true ]; then echo -e "  - @agro-erp/shared-utils: ${YELLOW}BUILD & TEST${NC}"; else echo -e "  - @agro-erp/shared-utils: ${GREEN}SKIPPED (No changes)${NC}"; fi
if [ "$CHANGED_UI" = true ]; then echo -e "  - @agro-erp/shared-ui:    ${YELLOW}BUILD & TEST${NC}"; else echo -e "  - @agro-erp/shared-ui:    ${GREEN}SKIPPED (No changes)${NC}"; fi
if [ "$CHANGED_APP" = true ]; then echo -e "  - @agro-erp/app:          ${YELLOW}BUILD & TEST & DEPLOY${NC}"; else echo -e "  - @agro-erp/app:          ${GREEN}SKIPPED (No changes)${NC}"; fi
echo ""

# Pipeline step execution helper
fail_pipeline() {
  echo -e "\n${RED}${BOLD}❌ PIPELINE FAILED at step: $1${NC}"
  exit 1
}

# Step 1: shared-utils
if [ "$CHANGED_UTILS" = true ]; then
  echo -e "${BLUE}${BOLD}[STEP 1/3] Testing and compiling @agro-erp/shared-utils...${NC}"
  npm run test -w @agro-erp/shared-utils || fail_pipeline "Testing @agro-erp/shared-utils"
  echo -e "${GREEN}✓ @agro-erp/shared-utils passed tests!${NC}\n"
fi

# Step 2: shared-ui
if [ "$CHANGED_UI" = true ]; then
  echo -e "${BLUE}${BOLD}[STEP 2/3] Testing and compiling @agro-erp/shared-ui...${NC}"
  npm run test -w @agro-erp/shared-ui || fail_pipeline "Testing @agro-erp/shared-ui"
  echo -e "${GREEN}✓ @agro-erp/shared-ui passed tests!${NC}\n"
fi

# Step 3: main app
if [ "$CHANGED_APP" = true ] || [ "$CHANGED_UI" = true ] || [ "$CHANGED_UTILS" = true ]; then
  # If any underlying libraries changed, we should rebuild and compile the app to verify full integration!
  echo -e "${BLUE}${BOLD}[STEP 3/3] Linting and building main app (@agro-erp/app)...${NC}"
  
  echo "Running type-check & linter..."
  npm run lint || fail_pipeline "Linting @agro-erp/app"
  
  echo "Building static production package..."
  npm run build || fail_pipeline "Building @agro-erp/app"
  
  echo -e "${GREEN}✓ @agro-erp/app built successfully to /dist!${NC}"
  echo -e "${GREEN}✓ Simulated deployment of Agro ERP static frontend is complete!${NC}\n"
fi

echo -e "${GREEN}${BOLD}=====================================================${NC}"
echo -e "${GREEN}${BOLD}      🎉 PIPELINE SUCCESSFUL — ALL STAGES GREEN       ${NC}"
echo -e "${GREEN}${BOLD}=====================================================${NC}"
