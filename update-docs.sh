#!/bin/bash

# رنگ‌ها
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# تاریخ امروز
DATE=$(date +%Y-%m-%d)

echo -e "${BLUE}Updating CHANGELOG.md...${NC}"
echo ""
echo "Enter change description (press Ctrl+D when done):"
CHANGES=$(cat)

# اضافه کردن تغییرات جدید به CHANGELOG.md
sed -i "4i\\\n## [$DATE]\n$CHANGES\n" CHANGELOG.md

echo -e "${GREEN}Documentation updated successfully!${NC}"
