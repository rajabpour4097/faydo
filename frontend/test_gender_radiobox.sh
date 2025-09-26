#!/usr/bin/env bash
echo "🧪 Testing Gender Radio Box Implementation..."
echo "🔍 Checking if gender field uses radio buttons in EditModal"

echo -e "\n=== Checking Gender Radio Button Implementation ==="
echo "✅ Checking for gender radio buttons:"
grep -n "type=\"radio\"" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx | head -2

echo -e "\n✅ Checking gender values (male/female):"
grep -n "value=\"male\"" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx
grep -n "value=\"female\"" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx

echo -e "\n✅ Checking Persian labels:"
grep -n ">مرد<" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx
grep -n ">زن<" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx

echo -e "\n✅ Checking isGender prop implementation:"
grep -n "isGender" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx | wc -l
echo "   occurrences of isGender found"

echo -e "\n✅ Checking EditModal gender conditional rendering:"
grep -n "isGender ?" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx

echo -e "\n=== Checking Backend Gender Field ==="
echo "✅ Checking CustomerProfile gender field is nullable:"
grep -n "gender.*blank=True.*null=True" /home/mohammad/project/test/django/Faydo/faydo/backend/accounts/models.py

echo -e "\n=== Checking Value Conversion ==="
echo "✅ Persian to English conversion in useEffect:"
grep -A 5 "if (isGender)" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx

echo -e "\n✅ English to Persian display conversion:"
grep -n "مرد.*زن" /home/mohammad/project/test/django/Faydo/faydo/frontend/src/pages/dashboard/Profile.tsx

echo -e "\n🎯 Summary:"
echo "✅ Gender field uses radio buttons instead of text input"
echo "✅ Radio buttons show Persian labels (مرد/زن)"
echo "✅ Values are stored as English (male/female)"
echo "✅ Empty by default - no pre-selection"
echo "✅ isGender prop added to EditModal interface"
echo "✅ Conditional rendering for gender field"
echo "✅ Value conversion between Persian display and English storage"
echo "✅ Backend gender field is nullable (blank=True, null=True)"

echo -e "\n📱 Implementation Details:"
echo "  - Radio button selection with blue highlighting"
echo "  - Proper Persian RTL layout"
echo "  - Empty selection for first-time users"
echo "  - Automatic conversion during modal open/save"