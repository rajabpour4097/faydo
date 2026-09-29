from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import BusinessProfile, CustomerProfile
from loyalty.models import CustomerLoyalty, Transaction
from packages.models import Comment

User = get_user_model()


class CommentReplyTests(TestCase):
    def setUp(self):
        self.customer_user = User.objects.create_user(
            username='cust-reply',
            password='pass12345',
            role='customer',
            phone_number='09121110001',
            first_name='علی',
            last_name='رضایی',
        )
        self.customer = CustomerProfile.objects.create(user=self.customer_user)
        self.other_user = User.objects.create_user(
            username='cust-liker',
            password='pass12345',
            role='customer',
            phone_number='09121110002',
            first_name='سارا',
            last_name='کریمی',
        )
        CustomerProfile.objects.create(user=self.other_user)
        self.business_user = User.objects.create_user(
            username='biz-owner',
            password='pass12345',
            role='business',
            phone_number='09121110003',
        )
        self.business = BusinessProfile.objects.create(user=self.business_user, name='کافه نمونه')
        self.other_business_user = User.objects.create_user(
            username='biz-other',
            password='pass12345',
            role='business',
            phone_number='09121110004',
        )
        BusinessProfile.objects.create(user=self.other_business_user, name='فروشگاه دیگر')
        loyalty = CustomerLoyalty.objects.create(customer=self.customer, business=self.business)
        self.tx = Transaction.objects.create(
            customer=self.customer,
            business=self.business,
            loyalty=loyalty,
            original_amount=100000,
            status='approved',
            has_commented=True,
            can_comment=True,
        )
        self.comment = Comment.objects.create(
            content_object=self.tx,
            user=self.customer,
            text='خدمات عالی بود',
            score=5,
            service_type='discount_all',
        )
        self.client = APIClient()

    def test_only_owning_business_can_reply_and_review_is_visible(self):
        self.client.force_authenticate(self.customer_user)
        denied = self.client.post(
            f'/api/loyalty/transactions/{self.tx.id}/reply/',
            {'text': 'ممنون'},
            format='json',
        )
        self.assertEqual(denied.status_code, 403)

        self.client.force_authenticate(self.other_business_user)
        foreign = self.client.post(
            f'/api/loyalty/transactions/{self.tx.id}/reply/',
            {'text': 'ممنون'},
            format='json',
        )
        self.assertEqual(foreign.status_code, 404)

        self.client.force_authenticate(self.business_user)
        empty = self.client.post(
            f'/api/loyalty/transactions/{self.tx.id}/reply/',
            {'text': '   '},
            format='json',
        )
        self.assertEqual(empty.status_code, 400)

        created = self.client.post(
            f'/api/loyalty/transactions/{self.tx.id}/reply/',
            {'text': 'از نظر شما سپاسگزاریم'},
            format='json',
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data['reply']['content'], 'از نظر شما سپاسگزاریم')
        self.assertEqual(created.data['reply']['business_name'], 'کافه نمونه')

        review = self.client.get(f'/api/loyalty/transactions/{self.tx.id}/review/')
        self.assertEqual(review.status_code, 200)
        self.assertEqual(review.data['comment']['content'], 'خدمات عالی بود')
        self.assertEqual(review.data['comment']['score'], 5)
        self.assertEqual(review.data['comment']['reply']['content'], 'از نظر شما سپاسگزاریم')

    def test_reply_is_likable_and_shown_under_the_comment(self):
        self.client.force_authenticate(self.business_user)
        self.client.post(
            f'/api/loyalty/transactions/{self.tx.id}/reply/',
            {'text': 'خوشحالیم'},
            format='json',
        )

        self.client.force_authenticate(self.other_user)
        liked = self.client.post(f'/api/packages/comments/{self.comment.id}/like_reply/')
        self.assertEqual(liked.status_code, 200)
        self.assertTrue(liked.data['is_liked'])
        self.assertEqual(liked.data['likes_count'], 1)

        unliked = self.client.post(f'/api/packages/comments/{self.comment.id}/like_reply/')
        self.assertFalse(unliked.data['is_liked'])
        self.assertEqual(unliked.data['likes_count'], 0)

        self.client.post(f'/api/packages/comments/{self.comment.id}/like_reply/')
        comments = self.client.get(f'/api/packages/packages/business/{self.business.id}/comments/')
        self.assertEqual(comments.status_code, 200)
        match = [item for item in comments.data if item['id'] == self.comment.id]
        self.assertEqual(len(match), 1)
        self.assertEqual(match[0]['reply']['content'], 'خوشحالیم')
        self.assertTrue(match[0]['reply']['is_liked'])
        self.assertEqual(match[0]['reply']['likes_count'], 1)

        self.client.force_authenticate(self.business_user)
        business_like = self.client.post(f'/api/packages/comments/{self.comment.id}/like_reply/')
        self.assertEqual(business_like.status_code, 400)
