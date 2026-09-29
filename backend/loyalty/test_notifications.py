from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import BusinessProfile, CustomerProfile
from loyalty.models import CustomerLoyalty, Notification, Transaction


User = get_user_model()


class NotificationTests(TestCase):
    def setUp(self):
        self.customer_user = User.objects.create_user(
            username='notification-customer',
            password='pass12345',
            role='customer',
            phone_number='09120001001',
            first_name='مریم',
            last_name='احمدی',
        )
        self.customer = CustomerProfile.objects.create(user=self.customer_user)
        self.business_user = User.objects.create_user(
            username='notification-business',
            password='pass12345',
            role='business',
            phone_number='09120001002',
        )
        self.business = BusinessProfile.objects.create(user=self.business_user, name='فروشگاه نمونه')
        self.loyalty = CustomerLoyalty.objects.create(customer=self.customer, business=self.business)
        self.client = APIClient()

    def test_transaction_events_notify_correct_recipient(self):
        transaction = Transaction.objects.create(
            customer=self.customer,
            business=self.business,
            loyalty=self.loyalty,
            original_amount=100000,
        )
        self.assertTrue(Notification.objects.filter(
            recipient=self.business_user,
            notification_type='transaction_created',
        ).exists())

        transaction.approve()
        self.assertTrue(Notification.objects.filter(
            recipient=self.customer_user,
            notification_type='transaction_approved',
        ).exists())

    def test_user_can_only_manage_own_notifications(self):
        own = Notification.objects.create(
            recipient=self.customer_user,
            title='اعلان آزمایشی',
            message='متن',
        )
        other = Notification.objects.create(
            recipient=self.business_user,
            title='اعلان دیگر',
            message='متن',
        )
        self.client.force_authenticate(self.customer_user)

        listed = self.client.get('/api/loyalty/notifications/')
        self.assertEqual(listed.status_code, 200)
        ids = [item['id'] for item in listed.data['results']]
        self.assertIn(own.id, ids)
        self.assertNotIn(other.id, ids)

        marked = self.client.post(f'/api/loyalty/notifications/{own.id}/mark_read/')
        self.assertEqual(marked.status_code, 200)
        own.refresh_from_db()
        self.assertIsNotNone(own.read_at)

        denied = self.client.post(f'/api/loyalty/notifications/{other.id}/mark_read/')
        self.assertEqual(denied.status_code, 404)
