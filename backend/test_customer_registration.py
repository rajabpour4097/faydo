#!/usr/bin/env python
"""
Test script for customer registration and profile display
"""
import os
import sys
import django

# Add the project directory to Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, CustomerProfile, City, Province
from accounts.serializers import UserProfileSerializer, CustomerRegistrationSerializer

def test_customer_registration():
    print("=== Testing Customer Registration & Profile Display ===\n")
    
    # Create or get test province and city
    province, created = Province.objects.get_or_create(name='تست')
    city, created = City.objects.get_or_create(name='تهران', province=province)
    
    # Test 1: Create customer without names (like new registration)
    print("1. Creating customer without names (like new registration)...")
    user1 = User.objects.create_user(
        username='new_customer',
        email='new@test.com',
        phone_number='09123456789',
        role='customer',
        # No first_name and last_name provided - should remain empty
    )
    profile1, created = CustomerProfile.objects.get_or_create(user=user1)
    
    print(f"   User first_name: '{user1.first_name or ''}'")
    print(f"   User last_name: '{user1.last_name or ''}'")
    print(f"   Profile complete: {profile1.is_profile_complete()}")
    print(f"   Expected: False (empty names)\n")
    
    # Test serializer display_name
    serializer = UserProfileSerializer(user1)
    print(f"   Serialized display_name: '{serializer.data['display_name']}'")
    print(f"   Expected: 'کاربر جدید'\n")
    
    # Test 2: Complete the profile
    print("2. Completing the profile with names...")
    user1.first_name = 'احمد'
    user1.last_name = 'محمدی'
    user1.save()
    
    profile1.gender = 'male'
    profile1.birth_date = '1990-01-01'
    profile1.city = city
    profile1.save()
    
    profile1.refresh_from_db()
    user1.refresh_from_db()
    
    print(f"   User first_name: '{user1.first_name}'")
    print(f"   User last_name: '{user1.last_name}'")
    print(f"   Profile complete: {profile1.is_profile_complete()}")
    print(f"   Expected: True\n")
    
    # Test serializer display_name after completion
    serializer = UserProfileSerializer(user1)
    print(f"   Serialized display_name: '{serializer.data['display_name']}'")
    print(f"   Expected: 'احمد محمدی'\n")
    
    # Test 3: Test registration serializer behavior
    print("3. Testing registration serializer...")
    registration_data = {
        'username': 'test_customer2',
        'email': 'test2@example.com',
        'phone_number': '09123456788',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        # Note: no first_name, last_name provided
        'gender': 'male',  # Provide valid gender for registration test
        'birth_date': '1990-01-01',  # Provide valid date
        'address': ''
    }
    
    serializer = CustomerRegistrationSerializer(data=registration_data)
    if serializer.is_valid():
        profile = serializer.save()
        user = profile.user
        print(f"   Created user first_name: '{user.first_name}'")
        print(f"   Created user last_name: '{user.last_name}'")
        print(f"   Profile complete: {profile.is_profile_complete()}")
        print(f"   Expected: False (empty names)\n")
        
        # Test display name for new user
        display_serializer = UserProfileSerializer(user)
        print(f"   New user display_name: '{display_serializer.data['display_name']}'")
        print(f"   Expected: 'کاربر جدید'\n")
    else:
        print(f"   Serializer errors: {serializer.errors}\n")
    
    # Cleanup
    print("4. Cleaning up test data...")
    User.objects.filter(username__in=['new_customer', 'test_customer2']).delete()
    print("   Test data cleaned up")
    
    print("\n=== Customer Registration Tests Completed ===")

if __name__ == '__main__':
    test_customer_registration()