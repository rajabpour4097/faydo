#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from packages.models import Comment
from django.contrib.contenttypes.models import ContentType

print(f'Total comments: {Comment.objects.count()}')
print('\nComments by content type:')
for ct in ContentType.objects.all():
    comments = Comment.objects.filter(content_type=ct)
    if comments.exists():
        print(f'  {ct.app_label}.{ct.model}: {comments.count()}')
        for comment in comments[:3]:  # Show first 3
            print(f'    - ID: {comment.id}, User: {comment.user}, Text: {comment.text[:50] if comment.text else "No text"}')
