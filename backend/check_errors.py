#!/usr/bin/env python3
"""
Script to check Django errors and test endpoints
"""

import os
import sys
import django
import traceback
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_sms_endpoint():
    """Test SMS endpoint directly"""
    print("=== Testing SMS Endpoint ===")
    
    try:
        from accounts.sms_service import send_activation_sms
        
        # Test with a dummy phone number
        result = send_activation_sms("09123456789")
        print(f"SMS Service Result: {result}")
        
        if result.get('success'):
            print("✓ SMS service working")
            return True
        else:
            print(f"✗ SMS service failed: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"✗ SMS service error: {e}")
        traceback.print_exc()
        return False

def test_otp_endpoint():
    """Test OTP endpoint"""
    print("\n=== Testing OTP Endpoint ===")
    
    try:
        from django.test import Client
        from django.urls import reverse
        
        client = Client()
        
        # Test send-otp endpoint
        response = client.post('/api/accounts/auth/send-otp/', {
            'phone_number': '09123456789'
        }, content_type='application/json')
        
        print(f"Send OTP Response Status: {response.status_code}")
        print(f"Send OTP Response Content: {response.content.decode()[:200]}")
        
        if response.status_code == 200:
            print("✓ Send OTP endpoint working")
            return True
        else:
            print(f"✗ Send OTP endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ OTP endpoint error: {e}")
        traceback.print_exc()
        return False

def test_register_endpoint():
    """Test register endpoint"""
    print("\n=== Testing Register Endpoint ===")
    
    try:
        from django.test import Client
        
        client = Client()
        
        # Test register endpoint
        register_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '09123456789',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'gender': 'male',
            'birth_date': '1990-01-01'
        }
        
        response = client.post('/api/accounts/auth/register/', 
                              register_data, 
                              content_type='application/json')
        
        print(f"Register Response Status: {response.status_code}")
        print(f"Register Response Content: {response.content.decode()[:200]}")
        
        if response.status_code in [200, 201]:
            print("✓ Register endpoint working")
            return True
        else:
            print(f"✗ Register endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Register endpoint error: {e}")
        traceback.print_exc()
        return False

def check_django_settings():
    """Check Django settings"""
    print("=== Django Settings ===")
    
    try:
        from django.conf import settings
        
        print(f"DEBUG: {settings.DEBUG}")
        print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"CORS_ALLOW_ALL_ORIGINS: {getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'Not set')}")
        print(f"MELIPAYAMAK_USERNAME: {getattr(settings, 'MELIPAYAMAK_USERNAME', 'Not set')}")
        print(f"MELIPAYAMAK_PASSWORD: {'Set' if getattr(settings, 'MELIPAYAMAK_PASSWORD', None) else 'Not set'}")
        
        return True
    except Exception as e:
        print(f"✗ Settings error: {e}")
        return False

if __name__ == "__main__":
    print("=== Django Error Checker ===")
    
    # Check settings
    settings_ok = check_django_settings()
    print()
    
    # Test SMS service
    sms_ok = test_sms_endpoint()
    print()
    
    # Test OTP endpoint
    otp_ok = test_otp_endpoint()
    print()
    
    # Test register endpoint
    register_ok = test_register_endpoint()
    print()
    
    print("=== Summary ===")
    print(f"Settings: {'✓' if settings_ok else '✗'}")
    print(f"SMS Service: {'✓' if sms_ok else '✗'}")
    print(f"OTP Endpoint: {'✓' if otp_ok else '✗'}")
    print(f"Register Endpoint: {'✓' if register_ok else '✗'}")
    
    if all([settings_ok, sms_ok, otp_ok, register_ok]):
        print("\n✓ All tests passed!")
    else:
        print("\n✗ Some tests failed. Check the errors above.")
