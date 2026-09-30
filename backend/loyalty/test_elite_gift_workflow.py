from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import BusinessProfile, CustomerProfile
from loyalty.models import CustomerLoyalty, EliteGiftClaim, Notification, Transaction
from packages.models import EliteGift, Package


User = get_user_model()


class EliteGiftWorkflowTests(TestCase):
    def setUp(self):
        self.customer_user = User.objects.create_user(
            username='gift-customer',
            password='pass12345',
            phone_number='09120002001',
            first_name='علی',
            last_name='محمدی',
            role='customer',
        )
        self.customer = CustomerProfile.objects.create(user=self.customer_user)
        self.business_user = User.objects.create_user(
            username='gift-business',
            password='pass12345',
            phone_number='09120002002',
            role='business',
        )
        self.business = BusinessProfile.objects.create(
            user=self.business_user,
            name='کافه نمونه',
        )
        self.package = Package.objects.create(
            business=self.business,
            is_active=True,
            is_complete=True,
            status='approved',
            start_date=timezone.localdate() - timedelta(days=10),
            end_date=timezone.localdate() + timedelta(days=30),
        )
        self.gift = EliteGift.objects.create(
            package=self.package,
            count=2,
            gift='نوشیدنی رایگان',
        )
        self.loyalty = CustomerLoyalty.objects.create(
            customer=self.customer,
            business=self.business,
        )
        for _ in range(2):
            Transaction.objects.create(
                customer=self.customer,
                business=self.business,
                package=self.package,
                loyalty=self.loyalty,
                original_amount=100000,
                final_amount=100000,
                status='approved',
            )
        self.client = APIClient()

    def test_claim_reserves_reward_and_resets_progress(self):
        self.assertTrue(self.gift.get_customer_progress(self.customer)['eligible'])
        self.client.force_authenticate(self.customer_user)

        response = self.client.post(
            '/api/loyalty/elite-gift-claims/',
            {'package_id': self.package.id},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        progress = self.gift.get_customer_progress(self.customer)
        self.assertEqual(progress['current'], 0)
        self.assertEqual(progress['percentage'], 0)
        self.assertTrue(Notification.objects.filter(
            recipient=self.business_user,
            notification_type='gift_claim_created',
        ).exists())

    def test_business_schedules_delivery_and_customer_is_notified(self):
        claim = EliteGiftClaim.objects.create(
            customer=self.customer,
            business=self.business,
            package=self.package,
            elite_gift=self.gift,
            progress_at_claim=self.gift.get_customer_progress(self.customer),
        )
        delivery = timezone.localdate() + timedelta(days=2)
        self.client.force_authenticate(self.business_user)

        response = self.client.post(
            f'/api/loyalty/elite-gift-claims/{claim.id}/approve/',
            {'delivery_date': delivery.isoformat(), 'note': 'همراه داشتن کارت عضویت'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        claim.refresh_from_db()
        self.assertEqual(claim.status, 'approved')
        self.assertEqual(self.gift.get_customer_progress(self.customer)['current'], 0)
        self.assertAlmostEqual(
            (claim.expires_at - claim.scheduled_for).total_seconds(),
            timedelta(days=7).total_seconds(),
        )
        notification = Notification.objects.get(
            recipient=self.customer_user,
            notification_type='gift_claim_approved',
        )
        self.assertIn(self.business.name, notification.message)
        self.assertIn('تاریخ تحویل', notification.message)

        self.client.force_authenticate(self.customer_user)
        transactions = self.client.get('/api/loyalty/transactions/')
        gift_transaction = next(
            item for item in transactions.data['results']
            if item['transaction_type'] == 'elite_gift'
        )
        self.assertEqual(gift_transaction['gift_claim_id'], claim.id)
        self.assertEqual(gift_transaction['gift_claim_status'], 'approved')
        self.assertIsNotNone(gift_transaction['gift_scheduled_for'])

    def test_delivery_cannot_be_more_than_three_days_away(self):
        claim = EliteGiftClaim.objects.create(
            customer=self.customer,
            business=self.business,
            package=self.package,
            elite_gift=self.gift,
            progress_at_claim={},
        )
        self.client.force_authenticate(self.business_user)

        today_response = self.client.post(
            f'/api/loyalty/elite-gift-claims/{claim.id}/approve/',
            {'delivery_date': timezone.localdate().isoformat()},
            format='json',
        )
        response = self.client.post(
            f'/api/loyalty/elite-gift-claims/{claim.id}/approve/',
            {'delivery_date': (timezone.localdate() + timedelta(days=4)).isoformat()},
            format='json',
        )

        self.assertEqual(today_response.status_code, 400)
        self.assertEqual(response.status_code, 400)
        claim.refresh_from_db()
        self.assertEqual(claim.status, 'pending')

    def test_business_customer_table_contains_progress_and_request_status(self):
        EliteGiftClaim.objects.create(
            customer=self.customer,
            business=self.business,
            package=self.package,
            elite_gift=self.gift,
            progress_at_claim=self.gift.get_customer_progress(self.customer),
        )
        no_purchase_user = User.objects.create_user(
            username='gift-no-purchase',
            password='pass12345',
            phone_number='09120002003',
            role='customer',
        )
        no_purchase_customer = CustomerProfile.objects.create(user=no_purchase_user)
        CustomerLoyalty.objects.create(
            customer=no_purchase_customer,
            business=self.business,
        )
        self.client.force_authenticate(self.business_user)

        response = self.client.get('/api/loyalty/elite-gift-claims/customers/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['customers']), 1)
        row = response.data['customers'][0]
        self.assertEqual(row['customer_id'], self.customer.id)
        self.assertEqual(row['status'], 'pending')
        self.assertEqual(row['progress']['percentage'], 0)
        self.assertIsNotNone(row['last_purchase_at'])
