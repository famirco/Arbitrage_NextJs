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

# ایجاد یک فایل موقت و اضافه کردن تغییرات جدید
(
echo "# Changelog"
echo ""
echo "## [$DATE]"
echo "$CHANGES"
echo ""
cat CHANGELOG.md | tail -n +2
) > CHANGELOG.tmp

# جایگزینی فایل اصلی با فایل موقت
mv CHANGELOG.tmp CHANGELOG.md

echo -e "${GREEN}Documentation updated successfully!${NC}"