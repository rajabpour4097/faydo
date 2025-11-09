#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from packages.models import Comment, Package
from accounts.models import BusinessProfile
from django.contrib.contenttypes.models import ContentType

print("=== بررسی نظرات و امتیازات ===\n")

# لیست تمام نظرات
all_comments = Comment.objects.all()
print(f"تعداد کل نظرات: {all_comments.count()}\n")

for comment in all_comments:
    print(f"Comment ID: {comment.id}")
    print(f"  User: {comment.user}")
    print(f"  Text: {comment.text}")
    print(f"  Score: {comment.score}")  # این مهم است!
    print(f"  Content Type: {comment.content_type}")
    print(f"  Object ID: {comment.object_id}")
    print(f"  Created: {comment.created_at}")
    print()

# بررسی پکیج‌ها
print("\n=== بررسی امتیازات پکیج‌ها ===\n")
packages = Package.objects.all()

for package in packages:
    avg_rating = package.get_average_rating()
    total_comments = package.get_total_comments_count()
    
    if total_comments > 0:
        print(f"Package ID: {package.id}")
        print(f"  Business: {package.business.name}")
        print(f"  Average Rating: {avg_rating}")
        print(f"  Total Comments: {total_comments}")
        print()

# بررسی کسب‌وکارها
print("\n=== بررسی امتیازات کسب‌وکارها ===\n")
businesses = BusinessProfile.objects.all()

for business in businesses:
    avg_rating = business.get_average_rating()
    total_comments = business.get_total_comments_count()
    
    if total_comments > 0:
        print(f"Business: {business.name} (ID: {business.id})")
        print(f"  Average Rating: {avg_rating}")
        print(f"  Total Comments: {total_comments}")
        print()
