from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import User, CustomerProfile, BusinessProfile, ITManagerProfile, ProjectManagerProfile, SupporterProfile, FinancialManagerProfile


@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Create auth token for new users"""
    if created:
        Token.objects.create(user=instance)


# Profile creation is now handled in serializers, not signals
# Only keep admin and manager profiles auto-creation for staff users

@receiver(post_save, sender=User)
def create_admin_profiles(sender, instance, created, **kwargs):
    """Create admin/manager profiles for non-customer/business users"""
    if created:
        if instance.role == 'it_manager':
            ITManagerProfile.objects.create(user=instance)
        elif instance.role == 'project_manager':
            ProjectManagerProfile.objects.create(user=instance)
        elif instance.role == 'supporter':
            SupporterProfile.objects.create(user=instance)
        elif instance.role == 'financial_manager':
            FinancialManagerProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user is updated"""
    try:
        if instance.role == 'customer' and hasattr(instance, 'customerprofile'):
            instance.customerprofile.save()
        elif instance.role == 'business' and hasattr(instance, 'businessprofile'):
            instance.businessprofile.save()
        elif instance.role == 'it_manager' and hasattr(instance, 'itmanagerprofile'):
            instance.itmanagerprofile.save()
        elif instance.role == 'project_manager' and hasattr(instance, 'projectmanagerprofile'):
            instance.projectmanagerprofile.save()
        elif instance.role == 'supporter' and hasattr(instance, 'supporterprofile'):
            instance.supporterprofile.save()
        elif instance.role == 'financial_manager' and hasattr(instance, 'financialmanagerprofile'):
            instance.financialmanagerprofile.save()
    except:
        pass  # Handle cases where profile doesn't exist yet