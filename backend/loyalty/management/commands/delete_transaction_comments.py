from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from packages.models import Comment, DiscountAll, SpecificDiscount, EliteGift, VipExperience
from loyalty.models import Transaction


class Command(BaseCommand):
    help = 'حذف تمام نظرات مربوط به پکیج‌ها (که از طریق تراکنش‌ها ثبت شده‌اند)'

    def handle(self, *args, **options):
        total_deleted = 0
        
        # Delete comments on DiscountAll
        discount_all_ct = ContentType.objects.get_for_model(DiscountAll)
        discount_all_comments = Comment.objects.filter(content_type=discount_all_ct)
        count = discount_all_comments.count()
        if count > 0:
            discount_all_comments.delete()
            total_deleted += count
            self.stdout.write(f'  حذف {count} نظر از DiscountAll')
        
        # Delete comments on SpecificDiscount
        specific_discount_ct = ContentType.objects.get_for_model(SpecificDiscount)
        specific_discount_comments = Comment.objects.filter(content_type=specific_discount_ct)
        count = specific_discount_comments.count()
        if count > 0:
            specific_discount_comments.delete()
            total_deleted += count
            self.stdout.write(f'  حذف {count} نظر از SpecificDiscount')
        
        # Delete comments on EliteGift
        elite_gift_ct = ContentType.objects.get_for_model(EliteGift)
        elite_gift_comments = Comment.objects.filter(content_type=elite_gift_ct)
        count = elite_gift_comments.count()
        if count > 0:
            elite_gift_comments.delete()
            total_deleted += count
            self.stdout.write(f'  حذف {count} نظر از EliteGift')
        
        # Delete comments on VipExperience
        vip_experience_ct = ContentType.objects.get_for_model(VipExperience)
        vip_experience_comments = Comment.objects.filter(content_type=vip_experience_ct)
        count = vip_experience_comments.count()
        if count > 0:
            vip_experience_comments.delete()
            total_deleted += count
            self.stdout.write(f'  حذف {count} نظر از VipExperience')
        
        # Delete comments on Transaction (if any)
        transaction_ct = ContentType.objects.get_for_model(Transaction)
        transaction_comments = Comment.objects.filter(content_type=transaction_ct)
        count = transaction_comments.count()
        if count > 0:
            transaction_comments.delete()
            total_deleted += count
            self.stdout.write(f'  حذف {count} نظر از Transaction')
        
        if total_deleted == 0:
            self.stdout.write(
                self.style.WARNING('هیچ نظری یافت نشد.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\nجمع کل: با موفقیت {total_deleted} نظر حذف شد.')
            )
