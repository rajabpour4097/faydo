"""
نمونه‌هایی از نحوه تست API های تخفیفات
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

# 1. ابتدا باید login کنید و token بگیرید
def login_business():
    """Login به عنوان کسب‌وکار"""
    login_data = {
        "username": "business_user",
        "password": "your_password"
    }
    response = requests.post(f"{BASE_URL}/accounts/login/", json=login_data)
    if response.status_code == 200:
        return response.json()["access"]
    return None

def login_customer():
    """Login به عنوان مشتری"""
    login_data = {
        "username": "customer_user", 
        "password": "your_password"
    }
    response = requests.post(f"{BASE_URL}/accounts/login/", json=login_data)
    if response.status_code == 200:
        return response.json()["access"]
    return None

# 2. ایجاد تخفیف جدید (فقط کسب‌وکار)
def create_discount(token):
    """ایجاد تخفیف جدید"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # تاریخ شروع: امروز
    start_date = datetime.now()
    # تاریخ پایان: 30 روز بعد
    end_date = start_date + timedelta(days=30)
    
    discount_data = {
        "title": "تخفیف ویژه پاییز",
        "description": "تخفیف 20 درصدی برای تمام محصولات",
        "percentage": 20,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }
    
    response = requests.post(
        f"{BASE_URL}/discounts/discounts/", 
        json=discount_data,
        headers=headers
    )
    
    if response.status_code == 201:
        print("تخفیف با موفقیت ایجاد شد:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        return response.json()["id"]
    else:
        print(f"خطا در ایجاد تخفیف: {response.status_code}")
        print(response.text)
        return None

# 3. دریافت لیست تخفیفات
def get_discounts(token):
    """دریافت لیست تخفیفات"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/discounts/discounts/", headers=headers)
    
    if response.status_code == 200:
        print("لیست تخفیفات:")
        discounts = response.json()
        for discount in discounts.get("results", discounts):
            print(f"- {discount['title']}: {discount['percentage']}%")
        return discounts
    else:
        print(f"خطا در دریافت تخفیفات: {response.status_code}")
        return None

# 4. امتیازدهی به تخفیف (فقط مشتری)
def rate_discount(token, discount_id, score):
    """امتیازدهی به تخفیف"""
    headers = {"Authorization": f"Bearer {token}"}
    
    rating_data = {"score": score}
    
    response = requests.post(
        f"{BASE_URL}/discounts/discounts/{discount_id}/rate/",
        json=rating_data,
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"امتیاز {score} با موفقیت ثبت شد")
        return True
    else:
        print(f"خطا در ثبت امتیاز: {response.status_code}")
        print(response.text)
        return False

# 5. ثبت نظر (فقط مشتری)
def add_comment(token, discount_id, comment):
    """ثبت نظر برای تخفیف"""
    headers = {"Authorization": f"Bearer {token}"}
    
    comment_data = {"comment": comment}
    
    response = requests.post(
        f"{BASE_URL}/discounts/discounts/{discount_id}/comment/",
        json=comment_data,
        headers=headers
    )
    
    if response.status_code == 201:
        print("نظر با موفقیت ثبت شد")
        return True
    else:
        print(f"خطا در ثبت نظر: {response.status_code}")
        print(response.text)
        return False

# 6. دریافت نظرات
def get_comments(token, discount_id):
    """دریافت نظرات یک تخفیف"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/discounts/discounts/{discount_id}/comments/",
        headers=headers
    )
    
    if response.status_code == 200:
        comments = response.json()
        print(f"نظرات تخفیف {discount_id}:")
        for comment in comments:
            print(f"- {comment['user_name']}: {comment['comment']}")
        return comments
    else:
        print(f"خطا در دریافت نظرات: {response.status_code}")
        return None

# 7. گزارش تخلف (فقط مشتری)
def report_discount(token, discount_id, reason):
    """گزارش تخلف تخفیف"""
    headers = {"Authorization": f"Bearer {token}"}
    
    report_data = {"reason": reason}
    
    response = requests.post(
        f"{BASE_URL}/discounts/discounts/{discount_id}/report/",
        json=report_data,
        headers=headers
    )
    
    if response.status_code == 201:
        print("گزارش با موفقیت ثبت شد")
        return True
    else:
        print(f"خطا در ثبت گزارش: {response.status_code}")
        print(response.text)
        return False

# 8. دریافت خلاصه داشبورد (فقط کسب‌وکار)
def get_dashboard_summary(token):
    """دریافت خلاصه داشبورد"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/discounts/discounts/dashboard_summary/",
        headers=headers
    )
    
    if response.status_code == 200:
        summary = response.json()
        print("خلاصه داشبورد:")
        print(f"- کل تخفیفات: {summary['total_discounts']}")
        print(f"- تخفیفات فعال: {summary['active_discounts']}")
        print(f"- تخفیفات منقضی: {summary['expired_discounts']}")
        return summary
    else:
        print(f"خطا در دریافت خلاصه: {response.status_code}")
        return None

# نمونه استفاده:
if __name__ == "__main__":
    # 1. Login کسب‌وکار
    business_token = login_business()
    if business_token:
        print("✅ Login کسب‌وکار موفق")
        
        # 2. ایجاد تخفیف
        discount_id = create_discount(business_token)
        
        # 3. دریافت خلاصه داشبورد
        get_dashboard_summary(business_token)
        
        # 4. دریافت لیست تخفیفات
        get_discounts(business_token)
    
    # 5. Login مشتری
    customer_token = login_customer()
    if customer_token and discount_id:
        print("✅ Login مشتری موفق")
        
        # 6. امتیازدهی
        rate_discount(customer_token, discount_id, 5)
        
        # 7. ثبت نظر
        add_comment(customer_token, discount_id, "تخفیف عالی بود!")
        
        # 8. مشاهده نظرات
        get_comments(customer_token, discount_id)
        
        # 9. گزارش تخلف (اختیاری)
        # report_discount(customer_token, discount_id, "مشکل در شرایط تخفیف")
