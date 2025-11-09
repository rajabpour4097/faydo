#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from packages.models import Comment, DiscountAll
from loyalty.models import Transaction
from django.contrib.contenttypes.models import ContentType

# Get all comments on DiscountAll
discount_all_ct = ContentType.objects.get_for_model(DiscountAll)
comments = Comment.objects.filter(content_type=discount_all_ct)

print(f'Found {comments.count()} comments on DiscountAll')
print('\nComment details:')

for comment in comments:
    discount_all = DiscountAll.objects.get(id=comment.object_id)
    package = discount_all.package
    
    print(f'\nComment ID: {comment.id}')
    print(f'  User: {comment.user}')
    print(f'  Text: {comment.text}')
    print(f'  Score: {comment.score}')
    print(f'  DiscountAll ID: {discount_all.id}')
    print(f'  Package ID: {package.id}')
    print(f'  Business: {package.business.user.get_full_name()}')
    
    # Find related transactions
    transactions = Transaction.objects.filter(
        customer=comment.user,
        business=package.business
    )
    print(f'  Related transactions: {transactions.count()}')
    for txn in transactions:
        print(f'    - Transaction ID: {txn.id}, Status: {txn.status}, Amount: {txn.final_amount}, Has commented: {txn.has_commented}')
