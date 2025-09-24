import random
import requests
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

def generate_otp():
    """Generate 6-digit OTP code"""
    return str(random.randint(100000, 999999))

def store_otp(user_phone, otp, expire_time=300):
    """Store OTP in cache with expiration time (default 5 minutes)"""
    cache_key = f"otp_{user_phone}"
    cache.set(cache_key, otp, expire_time)
    logger.info(f"OTP stored for {user_phone}")

def verify_otp(user_phone, otp):
    """Verify OTP code for phone number"""
    cache_key = f"otp_{user_phone}"
    stored_otp = cache.get(cache_key)
    
    if stored_otp and stored_otp == otp:
        cache.delete(cache_key)
        logger.info(f"OTP verified successfully for {user_phone}")
        return True
    else:
        logger.warning(f"Invalid OTP attempt for {user_phone}")
        return False

def send_sms(to, body_id, text):
    """Send SMS using Melipayamak BaseServiceNumber API"""
    try:
        payload = {
            "username": settings.MELIPAYAMAK_USERNAME,
            "password": settings.MELIPAYAMAK_PASSWORD,
            "to": to.strip(),
            "bodyId": body_id,
            "text": text
        }
        
        response = requests.post("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", json=payload)
        result = response.json()
        
        if result.get("RetStatus") != 1:
            logger.error(f"SMS failed for {to}: {result.get('StrRetStatus')}")
            return False, f"SMS failed: {result.get('StrRetStatus')}"
        
        logger.info(f"SMS sent successfully to {to}")
        return True, None
        
    except Exception as e:
        logger.error(f"SMS service error: {str(e)}")
        return False, str(e)

def send_activation_sms(phone_number):
    """Send activation SMS with OTP"""
    otp = generate_otp()
    store_otp(phone_number, otp)
    
    # Using bodyId 337375 as specified in your sample
    ok, error = send_sms(phone_number, "337375", otp)
    
    if ok:
        return {
            'success': True,
            'message': 'کد تایید ارسال شد',
            'otp_code': otp  # Remove this in production
        }
    else:
        return {
            'success': False,
            'message': f'خطا در ارسال پیامک: {error}'
        }

class MelipayamakSMSService:
    """
    SMS service for sending OTP codes using Melipayamak API
    Compatible with the new implementation
    """
    
    def send_otp(self, phone_number):
        """Send OTP code to phone number"""
        return send_activation_sms(phone_number)
    
    def verify_otp(self, phone_number, otp_code):
        """Verify OTP code for phone number"""
        cache_key = f"otp_{phone_number}"
        stored_otp = cache.get(cache_key)
        
        if stored_otp and stored_otp == otp_code:
            cache.delete(cache_key)
            logger.info(f"OTP verified successfully for {phone_number}")
            return {
                'success': True,
                'message': 'کد تایید صحیح است'
            }
        else:
            logger.warning(f"Invalid OTP attempt for {phone_number}")
            return {
                'success': False,
                'message': 'کد تایید نامعتبر یا منقضی شده است'
            }

# Create a singleton instance
sms_service = MelipayamakSMSService()
