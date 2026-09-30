from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CustomerLoyalty, Notification, Transaction, EliteGiftClaim, CustomerFavorite, available_cashback
from .transaction_utils import apply_transaction_filters, optimized_transactions
from .serializers import (
    CustomerLoyaltySerializer, TransactionSerializer,
    TransactionCreateSerializer, BusinessInfoSerializer,
    TransactionCommentSerializer, CustomerFavoriteSerializer, NotificationSerializer,
)
from accounts.models import BusinessProfile, CustomerProfile
from django.db import IntegrityError
from django.utils import timezone
from datetime import datetime, timedelta


def _gift_delivery_datetime(request):
    """تبدیل یکی از سه تاریخ مجاز به زمان داخلی سیستم."""
    from rest_framework import serializers

    delivery_date = serializers.DateField().run_validation(
        request.data.get('delivery_date')
    )
    today = timezone.localdate()
    if delivery_date < today + timedelta(days=1) or delivery_date > today + timedelta(days=3):
        raise serializers.ValidationError('تاریخ تحویل باید یکی از سه روز بعد باشد.')

    local_now = timezone.localtime()
    local_value = datetime.combine(
        delivery_date,
        local_now.time().replace(tzinfo=None, microsecond=0),
    )
    return timezone.make_aware(local_value, timezone.get_current_timezone())


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """فهرست و مدیریت اعلان‌های کاربر واردشده."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        unread = self.request.query_params.get('unread')
        notification_type = self.request.query_params.get('type')
        if unread in ('1', 'true'):
            queryset = queryset.filter(read_at__isnull=True)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        return queryset

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if notification.read_at is None:
            notification.read_at = timezone.now()
            notification.save(update_fields=['read_at', 'modified_at'])
        return Response(self.get_serializer(notification).data)

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        notification = self.get_object()
        notification.read_at = None
        notification.save(update_fields=['read_at', 'modified_at'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        count = self.get_queryset().filter(read_at__isnull=True).update(read_at=timezone.now())
        return Response({'updated': count})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        return Response({'count': self.get_queryset().filter(read_at__isnull=True).count()})

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        count, _ = self.get_queryset().filter(read_at__isnull=False).delete()
        return Response({'deleted': count})


class CustomerLoyaltyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet برای مشاهده وفاداری مشتریان
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomerLoyaltySerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return CustomerLoyalty.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return CustomerLoyalty.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return CustomerLoyalty.objects.all()
        
        return CustomerLoyalty.objects.none()


class TransactionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت تراکنش‌ها
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = TransactionPagination

    def get_queryset(self):
        user = self.request.user

        if user.role == 'customer':
            qs = Transaction.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            qs = Transaction.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            qs = Transaction.objects.all()
        else:
            return Transaction.objects.none()

        qs = optimized_transactions(qs)
        if self.action == 'list':
            qs = apply_transaction_filters(qs, self.request.query_params)
        return qs
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        return TransactionSerializer
    
    def create(self, request, *args, **kwargs):
        """
        ایجاد تراکنش جدید توسط مشتری
        """
        if request.user.role != 'customer':
            return Response(
                {'error': 'فقط مشتریان می‌توانند تراکنش ایجاد کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        
        # بازگشت با serializer کامل
        output_serializer = TransactionSerializer(transaction)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """
        تایید تراکنش توسط کسب‌وکار
        """
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکارها می‌توانند تراکنش را تایید کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        
        # بررسی اینکه تراکنش متعلق به این کسب‌وکار است
        if transaction.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به تایید این تراکنش نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            transaction.approve()
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """
        رد تراکنش توسط کسب‌وکار
        """
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکارها می‌توانند تراکنش را رد کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        
        # بررسی اینکه تراکنش متعلق به این کسب‌وکار است
        if transaction.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به رد این تراکنش نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            reason = (
                request.data.get('rejection_reason')
                or request.data.get('reason')
                or request.data.get('note')
                or ''
            )
            transaction.reject(reason)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request):
        """
        افزودن کامنت و امتیاز به تراکنش توسط مشتری
        """
        if request.user.role != 'customer':
            return Response(
                {'error': 'فقط مشتریان می‌توانند کامنت بگذارند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TransactionCommentSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                comment = serializer.save()
                return Response({
                    'success': True,
                    'message': 'کامنت شما با موفقیت ثبت شد',
                    'comment_id': comment.id,
                    'points_earned': int(getattr(comment, '_points_earned', 0) or 0),
                }, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response(
                    {'error': 'شما قبلاً برای این خرید نظر ثبت کرده‌اید'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _transaction_comment(self, transaction):
        from django.contrib.contenttypes.models import ContentType
        from packages.models import Comment
        content_type = ContentType.objects.get_for_model(transaction.__class__)
        return Comment.objects.filter(
            content_type=content_type,
            object_id=transaction.id,
        ).select_related(
            'user__user', 'business_reply__business'
        ).prefetch_related('likes', 'business_reply__likes').first()

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, pk=None):
        """نظر مشتری روی همین تراکنش، همراه با پاسخ کسب‌وکار در صورت وجود."""
        transaction = self.get_object()
        comment = self._transaction_comment(transaction)
        if comment is None:
            return Response({'comment': None})
        from packages.serializers import serialize_comment_for_display
        customer_profile = getattr(request.user, 'customerprofile', None) if request.user.role == 'customer' else None
        return Response({
            'comment': serialize_comment_for_display(
                comment,
                category=comment.service_type,
                customer_profile=customer_profile,
            )
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reply(self, request, pk=None):
        """فقط کسب‌وکار صاحب خدمت می‌تواند به نظر مشتری همین تراکنش پاسخ دهد."""
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند به نظر مشتری پاسخ دهد'},
                status=status.HTTP_403_FORBIDDEN,
            )

        transaction = self.get_object()
        business = request.user.businessprofile
        if transaction.business_id != business.id:
            return Response(
                {'error': 'شما مجاز به پاسخ‌دادن به نظر این تراکنش نیستید'},
                status=status.HTTP_403_FORBIDDEN,
            )

        comment = self._transaction_comment(transaction)
        if comment is None:
            return Response(
                {'error': 'برای این تراکنش نظری ثبت نشده است'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from packages.models import CommentReply, owning_business
        owner = owning_business(comment)
        if owner is None or owner.id != business.id:
            return Response(
                {'error': 'فقط کسب‌وکار ارائه‌دهنده این خدمت می‌تواند پاسخ دهد'},
                status=status.HTTP_403_FORBIDDEN,
            )

        text = (request.data.get('text') or '').strip()
        if not text:
            return Response(
                {'error': 'متن پاسخ را وارد کنید'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(text) > 2000:
            return Response(
                {'error': 'متن پاسخ نباید بیشتر از ۲۰۰۰ نویسه باشد'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reply, created = CommentReply.objects.update_or_create(
            comment=comment,
            defaults={'business': business, 'text': text},
        )
        Notification.objects.create(
            recipient=transaction.customer.user,
            notification_type='review_replied',
            title='پاسخ جدید به نظر شما',
            message=f'{business.name} به نظر شما درباره تراکنش پاسخ داد.',
            action_url=f'/dashboard/transactions?transaction={transaction.id}',
            metadata={'transaction_id': transaction.id, 'comment_id': comment.id},
        )
        reply = CommentReply.objects.select_related('business').prefetch_related('likes').get(pk=reply.pk)
        from packages.serializers import serialize_reply
        return Response(
            {'comment_id': comment.id, 'reply': serialize_reply(reply)},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def pending_count(self, request):
        """
        شمارش تراکنش‌های در انتظار تایید برای کسب‌وکار
        یا تراکنش‌های آماده نظردهی برای مشتری
        """
        user = request.user
        
        if user.role == 'business':
            # برای کسب‌وکار: تعداد تراکنش‌های pending
            count = Transaction.objects.filter(
                business=user.businessprofile,
                status='pending'
            ).count()
            return Response({
                'count': count,
                'type': 'pending_approval'
            })
        elif user.role == 'customer':
            # برای مشتری: تعداد تراکنش‌هایی که می‌تواند کامنت بگذارد
            count = Transaction.objects.filter(
                customer=user.customerprofile,
                can_comment=True,
                has_commented=False,
                status='approved',
            ).count()
            return Response({
                'count': count,
                'type': 'can_comment'
            })
        else:
            return Response({'count': 0, 'type': 'none'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_business_by_code(request):
    """
    دریافت اطلاعات کسب‌وکار با unique_code
    """
    if request.user.role != 'customer':
        return Response(
            {'error': 'فقط مشتریان می‌توانند از این API استفاده کنند'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    unique_code = request.query_params.get('code')
    if not unique_code:
        return Response(
            {'error': 'کد یکتا الزامی است'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        unique_code = int(unique_code)
    except ValueError:
        return Response(
            {'error': 'کد یکتا باید عدد باشد'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # دریافت کسب‌وکار
    business = get_object_or_404(BusinessProfile, unique_code=unique_code)
    
    # دریافت پکیج فعال
    package = business.packages.filter(is_active=True, status='approved').first()
    
    # دریافت یا ایجاد CustomerLoyalty
    customer = request.user.customerprofile
    loyalty, created = CustomerLoyalty.objects.get_or_create(
        customer=customer,
        business=business
    )
    
    # ساخت داده‌های پاسخ
    data = {
        'business_id': business.id,
        'business_name': business.name,
        'business_logo': business.logo.url if business.logo else None,
        'business_description': business.description or '',
        'service_category': business.category.name if business.category else '',
        
        # اطلاعات پکیج
        'package_id': package.id if package else None,
        'has_active_package': package is not None,
        'discount_all_percentage': None,
        'cashback_percentage': None,
        'has_specific_discount': False,
        'specific_discount_title': None,
        'specific_discount_percentage': None,
        'has_elite_gift': False,
        'elite_gift_title': None,
        'elite_gift_description': None,
        
        # اطلاعات مشتری
        'customer_points': loyalty.points,
        'customer_vip_status': loyalty.vip_status,
        'customer_membership_level': getattr(customer, 'membership_level', None) or 'bronze',
        'elite_gift_target_reached': loyalty.elite_gift_target_reached,
        'elite_gift_used': loyalty.elite_gift_used,
        'available_cashback': available_cashback(customer, business),
        'is_first_purchase': not Transaction.objects.filter(
            customer=customer, business=business, status='approved'
        ).exists(),
        'average_rating': business.get_average_rating() or float(business.rating_avg or 0),
        
        # دسترسی به ویژگی‌ها
        'can_use_elite_gift': loyalty.elite_gift_target_reached and not loyalty.elite_gift_used,
        'can_use_vip': loyalty.vip_status in ['vip', 'vip_plus'],
        'can_use_vip_plus': loyalty.vip_status == 'vip_plus',
    }
    
    # اگر پکیج فعال دارد
    if package:
        if hasattr(package, 'discount_all'):
            data['discount_all_percentage'] = package.discount_all.percentage
            data['cashback_percentage'] = getattr(package.discount_all, 'cashback_percentage', 0) or 0
        
        if hasattr(package, 'specific_discount'):
            data['has_specific_discount'] = True
            data['specific_discount_title'] = package.specific_discount.title
            data['specific_discount_percentage'] = package.specific_discount.percentage
        
        if hasattr(package, 'elite_gift'):
            data['has_elite_gift'] = True
            elite_gift = package.elite_gift
            data['elite_gift_title'] = elite_gift.gift
            
            # محاسبه پیشرفت برای بررسی eligible بودن
            progress = elite_gift.get_customer_progress(customer)
            
            # بروزرسانی can_use_elite_gift بر اساس eligible
            data['can_use_elite_gift'] = progress.get('eligible', False)
            
            # ساخت توضیحات هدیه
            if elite_gift.amount:
                data['elite_gift_description'] = f"هدیه به ارزش {elite_gift.amount:,} تومان"
            elif elite_gift.count:
                data['elite_gift_description'] = f"تعداد {elite_gift.count} عدد"
            else:
                data['elite_gift_description'] = elite_gift.gift
    
    serializer = BusinessInfoSerializer(data, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def elite_gift_progress(request, package_id):
    """
    دریافت پیشرفت مشتری برای دریافت هدیه ویژه
    """
    from packages.models import Package
    from .serializers import EliteGiftProgressSerializer
    
    # بررسی نقش کاربر
    if request.user.role != 'customer':
        return Response(
            {'error': 'فقط مشتریان می‌توانند پیشرفت خود را مشاهده کنند'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # پیدا کردن پکیج
    try:
        package = Package.objects.get(id=package_id)
    except Package.DoesNotExist:
        return Response(
            {'error': 'پکیج مورد نظر یافت نشد'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # بررسی وجود elite gift
    if not hasattr(package, 'elite_gift'):
        return Response(
            {'error': 'این پکیج هدیه ویژه ندارد'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # محاسبه پیشرفت
    elite_gift = package.elite_gift
    customer = request.user.customerprofile
    progress = elite_gift.get_customer_progress(customer)
    
    # اضافه کردن اطلاعات هدیه
    progress['gift_name'] = elite_gift.gift
    progress['gift_description'] = elite_gift.gift
    progress['package_id'] = package.id
    progress['package_start_date'] = package.start_date
    progress['package_end_date'] = package.end_date
    
    serializer = EliteGiftProgressSerializer(progress)
    return Response(serializer.data)


class EliteGiftClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت درخواست‌های هدیه ویژه
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return EliteGiftClaim.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return EliteGiftClaim.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return EliteGiftClaim.objects.all()
        
        return EliteGiftClaim.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            from .serializers import EliteGiftClaimCreateSerializer
            return EliteGiftClaimCreateSerializer
        from .serializers import EliteGiftClaimSerializer
        return EliteGiftClaimSerializer
    
    def create(self, request, *args, **kwargs):
        """
        ثبت درخواست جدید توسط مشتری
        """
        if request.user.role != 'customer':
            return Response(
                {'error': 'فقط مشتریان می‌توانند درخواست ثبت کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        تایید درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # بررسی دسترسی
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند درخواست را تایید کند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if claim.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به تایید این درخواست نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note')
            from rest_framework import serializers
            scheduled_for = _gift_delivery_datetime(request)
            claim.approve(scheduled_for=scheduled_for, note=note)
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
        except (ValueError, serializers.ValidationError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        رد درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # بررسی دسترسی
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند درخواست را رد کند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if claim.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به رد این درخواست نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note')
            claim.reject(note)
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_used(self, request, pk=None):
        """
        علامت‌گذاری به عنوان استفاده شده توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # بررسی دسترسی
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if claim.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به انجام این عملیات نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            claim.mark_as_used()
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class EliteGiftClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت درخواست‌های دریافت هدیه ویژه
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from .models import EliteGiftClaim
        user = self.request.user

        # بدون نیاز به کار زمان‌بندی‌شده، وضعیت هدایایی که مهلتشان تمام شده
        # هنگام هر مراجعه به این بخش قطعی می‌شود.
        EliteGiftClaim.objects.filter(
            status='approved',
            expires_at__isnull=False,
            expires_at__lte=timezone.now(),
        ).update(status='expired', modified_at=timezone.now())
        
        if user.role == 'customer':
            return EliteGiftClaim.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return EliteGiftClaim.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return EliteGiftClaim.objects.all()
        
        return EliteGiftClaim.objects.none()
    
    def get_serializer_class(self):
        from .serializers import EliteGiftClaimSerializer, EliteGiftClaimCreateSerializer
        
        if self.action == 'create':
            return EliteGiftClaimCreateSerializer
        return EliteGiftClaimSerializer
    
    def create(self, request, *args, **kwargs):
        """
        ایجاد درخواست دریافت هدیه ویژه
        """
        from .serializers import EliteGiftClaimCreateSerializer, EliteGiftClaimSerializer

        if request.user.role != 'customer':
            return Response(
                {'detail': 'فقط مشتریان می‌توانند درخواست هدیه ثبت کنند'},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        serializer = EliteGiftClaimCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        claim = serializer.save()
        
        # برگرداندن با serializer کامل
        output_serializer = EliteGiftClaimSerializer(claim)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """
        تایید درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # فقط کسب‌وکار می‌تواند تایید کند
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی اینکه این درخواست مربوط به همین کسب‌وکار است
        if claim.business != request.user.businessprofile:
            return Response(
                {'detail': 'این درخواست مربوط به کسب‌وکار شما نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note', '')
            from rest_framework import serializers

            scheduled_for = _gift_delivery_datetime(request)
            claim.approve(scheduled_for=scheduled_for, note=note)
            
            from .serializers import EliteGiftClaimSerializer
            serializer = EliteGiftClaimSerializer(claim)
            return Response(serializer.data)
        except (ValueError, serializers.ValidationError) as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """
        رد درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # فقط کسب‌وکار می‌تواند رد کند
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی اینکه این درخواست مربوط به همین کسب‌وکار است
        if claim.business != request.user.businessprofile:
            return Response(
                {'detail': 'این درخواست مربوط به کسب‌وکار شما نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note', '')
            claim.reject(note=note)
            
            from .serializers import EliteGiftClaimSerializer
            serializer = EliteGiftClaimSerializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_used(self, request, pk=None):
        """
        علامت‌گذاری هدیه به عنوان استفاده شده توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # فقط کسب‌وکار می‌تواند این عملیات را انجام دهد
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی اینکه این درخواست مربوط به همین کسب‌وکار است
        if claim.business != request.user.businessprofile:
            return Response(
                {'detail': 'این درخواست مربوط به کسب‌وکار شما نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            claim.mark_as_used()
            
            from .serializers import EliteGiftClaimSerializer
            serializer = EliteGiftClaimSerializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='customers')
    def customers(self, request):
        """جدول مدیریت مشتریان برنامه هدیه ویژه برای کسب‌وکار."""
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این بخش را مشاهده کند'},
                status=status.HTTP_403_FORBIDDEN,
            )

        from packages.models import Package

        business = request.user.businessprofile
        package = (
            Package.objects.filter(
                business=business,
                status='approved',
                is_active=True,
                elite_gift__isnull=False,
            )
            .select_related('elite_gift')
            .order_by('-id')
            .first()
        )
        if not package:
            return Response({'package': None, 'customers': []})

        # عضویت در باشگاه به‌تنهایی کافی نیست؛ فقط مشتری دارای حداقل یک
        # خرید عادی تاییدشده باید در مسیر دریافت هدیه نمایش داده شود.
        customer_ids = set(
            Transaction.objects.filter(
                business=business,
                status='approved',
            )
            .exclude(transaction_type='elite_gift')
            .values_list('customer_id', flat=True)
        )

        rows = []
        for customer in CustomerProfile.objects.filter(
            id__in=customer_ids
        ).select_related('user'):
            progress = package.elite_gift.get_customer_progress(customer)
            latest_purchase = (
                Transaction.objects.filter(
                    customer=customer,
                    business=business,
                    status='approved',
                )
                .exclude(transaction_type='elite_gift')
                .order_by('-created_at')
                .values_list('created_at', flat=True)
                .first()
            )
            latest_claim = (
                EliteGiftClaim.objects.filter(
                    customer=customer,
                    business=business,
                    package=package,
                )
                .order_by('-created_at')
                .first()
            )

            percentage = float(progress.get('percentage') or 0)
            if latest_claim and latest_claim.status in ('pending', 'approved', 'expired'):
                row_status = latest_claim.status
            elif progress.get('eligible'):
                row_status = 'ready'
            elif percentage >= 60:
                row_status = 'near'
            elif latest_claim and latest_claim.status in ('used', 'rejected') and percentage == 0:
                row_status = latest_claim.status
            else:
                row_status = 'in_progress'

            rows.append({
                'customer_id': customer.id,
                'customer_name': (
                    customer.user.get_full_name()
                    or customer.user.username
                    or customer.user.phone_number
                ),
                'progress': progress,
                'last_purchase_at': latest_purchase,
                'status': row_status,
                'claim': (
                    self.get_serializer(latest_claim).data
                    if latest_claim else None
                ),
            })

        rows.sort(
            key=lambda row: (
                row['status'] != 'pending',
                -float(row['progress'].get('percentage') or 0),
            )
        )
        return Response({
            'package': {
                'id': package.id,
                'gift_name': package.elite_gift.gift,
                'target_type': 'amount' if package.elite_gift.amount else 'count',
                'target': float(package.elite_gift.amount or package.elite_gift.count or 0),
            },
            'customers': rows,
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def points_summary(request):
    """
    خلاصه امتیازات مشتری برای dashboard
    GET /api/loyalty/points-summary/

    Self-healing: اگر کاربر هنوز امتیاز ثبت‌نام/پروفایل نگرفته باشد، اعطا می‌کند.
    این برای کاربرانی که قبل از پیاده‌سازی سیستم امتیاز ثبت‌نام کرده‌اند مفید است.
    """
    if request.user.role != 'customer':
        return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)

    from loyalty.services import (
        get_points_summary, award_registration, award_profile_complete
    )
    from loyalty.models import PointsEvent

    customer = request.user.customerprofile

    # Self-healing: اعطای امتیاز ثبت‌نام به کاربران قدیمی
    if not PointsEvent.objects.filter(customer=customer, event_type='registration').exists():
        try:
            award_registration(customer)
        except Exception:
            pass

    # Self-healing: اعطای امتیاز تکمیل پروفایل
    if customer.is_profile_complete():
        if not PointsEvent.objects.filter(customer=customer, event_type='profile_complete').exists():
            try:
                award_profile_complete(customer)
            except Exception:
                pass

    # Refresh از DB بعد از update احتمالی
    customer.refresh_from_db()
    data = get_points_summary(customer)
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def points_history(request):
    """
    تاریخچه رویدادهای امتیازی مشتری
    GET /api/loyalty/points-history/?page=1
    """
    if request.user.role != 'customer':
        return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)

    from loyalty.models import PointsEvent
    from loyalty.services import get_event_breakdown
    customer = request.user.customerprofile
    events = PointsEvent.objects.filter(customer=customer).order_by('-created_at')

    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    offset = (page - 1) * page_size
    total = events.count()

    data = []
    for ev in events[offset: offset + page_size]:
        breakdown = get_event_breakdown(ev)
        data.append({
            'id':                 ev.id,
            'event_type':         ev.event_type,
            'event_label':        ev.get_event_type_display(),
            'points_delta':       ev.points_delta,
            'active_score_delta': ev.active_score_delta,
            'description':        ev.description,
            'metadata':           ev.metadata or {},
            'breakdown':          breakdown,
            'is_composite':       len(breakdown) > 1,
            'created_at':         ev.created_at.isoformat(),
        })

    return Response({
        'count':       total,
        'page':        page,
        'total_pages': (total + page_size - 1) // page_size,
        'results':     data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def award_story_share(request):
    """
    ثبت اشتراک استوری
    POST /api/loyalty/story-share/
    """
    if request.user.role != 'customer':
        return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)
    from loyalty.services import award_story_share as _award
    _award(request.user.customerprofile)
    return Response({'message': 'امتیاز استوری ثبت شد'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def award_favorite_business(request):
    """
    ثبت امتیاز علاقه‌مندی
    POST /api/loyalty/favorite/
    """
    if request.user.role != 'customer':
        return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)
    business_id = request.data.get('business_id')
    if not business_id:
        return Response({'detail': 'business_id الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    from loyalty.services import award_favorite
    award_favorite(request.user.customerprofile, business_id)
    return Response({'message': 'امتیاز علاقه‌مندی ثبت شد'})


class CustomerFavoriteViewSet(viewsets.ModelViewSet):
    """
    مدیریت علاقه‌مندی‌های مشتری
    GET    /api/loyalty/favorites/
    POST   /api/loyalty/favorites/  { "package_id": 123 }
    DELETE /api/loyalty/favorites/{id}/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomerFavoriteSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role != 'customer':
            return CustomerFavorite.objects.none()
        return (
            CustomerFavorite.objects.filter(customer=user.customerprofile)
            .select_related(
                'package',
                'package__business',
                'package__business__category',
                'package__business__user',
            )
            .prefetch_related('package__business__gallery_images')
        )

    def list(self, request, *args, **kwargs):
        if request.user.role != 'customer':
            return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'customer':
            return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)

        package_id = request.data.get('package_id')
        if not package_id:
            return Response({'detail': 'package_id الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        from packages.models import Package
        from loyalty.services import award_favorite

        try:
            package_id = int(package_id)
        except (TypeError, ValueError):
            return Response({'detail': 'package_id نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        if package_id <= 0:
            return Response({'detail': 'پکیج نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        package = get_object_or_404(Package, id=package_id)
        if package.status != 'approved' or not package.is_active or not package.is_complete:
            return Response({'detail': 'این پکیج قابل افزودن به علاقه‌مندی نیست'}, status=status.HTTP_400_BAD_REQUEST)

        customer = request.user.customerprofile
        favorite, created = CustomerFavorite.objects.get_or_create(
            customer=customer,
            package=package,
        )

        if created:
            award_favorite(customer, package.business_id)

        serializer = self.get_serializer(favorite)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'customer':
            return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)
        favorite = self.get_object()
        if favorite.customer_id != request.user.customerprofile.id:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def elite_gift_progress(request, package_id):
    """
    دریافت پیشرفت کاربر در دریافت هدیه ویژه یک پکیج
    """
    from packages.models import Package
    from .serializers import EliteGiftProgressSerializer
    
    if request.user.role != 'customer':
        return Response(
            {'detail': 'فقط مشتریان می‌توانند پیشرفت خود را مشاهده کنند'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    package = get_object_or_404(Package, id=package_id)
    
    if not hasattr(package, 'elite_gift'):
        return Response(
            {'detail': 'این پکیج هدیه ویژه ندارد'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    elite_gift = package.elite_gift
    customer = request.user.customerprofile
    
    # دریافت پیشرفت
    progress = elite_gift.get_customer_progress(customer)
    
    # اضافه کردن اطلاعات هدیه و پکیج
    progress['gift_name'] = elite_gift.gift
    progress['gift_description'] = elite_gift.gift
    progress['package_id'] = package.id
    progress['package_start_date'] = package.start_date
    progress['package_end_date'] = package.end_date
    
    serializer = EliteGiftProgressSerializer(progress)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def cashback_summary(request):
    """
    مجموع و لیست کش‌بک‌های تاییدشده مشتری
    GET /api/loyalty/cashback-summary/?page=1
    """
    if request.user.role != 'customer':
        return Response({'detail': 'فقط مشتریان'}, status=status.HTTP_403_FORBIDDEN)

    from django.db.models import Sum

    customer = request.user.customerprofile
    queryset = Transaction.objects.filter(
        customer=customer,
        status='approved',
        cashback_amount__gt=0,
    ).select_related('business').order_by('-created_at')

    total_tomans = queryset.aggregate(total=Sum('cashback_amount'))['total'] or 0

    page = int(request.query_params.get('page', 1) or 1)
    page_size = int(request.query_params.get('page_size', 20) or 20)
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    total_count = queryset.count()
    total_pages = max(1, (total_count + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    results = []
    for tx in queryset[offset:offset + page_size]:
        logo = None
        if getattr(tx.business, 'logo', None):
            try:
                logo = tx.business.logo.url
            except Exception:
                logo = None
        results.append({
            'id': tx.id,
            'business_id': tx.business_id,
            'business_name': tx.business.name,
            'business_logo': logo,
            'amount': int(tx.cashback_amount or 0),
            'original_amount': int(tx.original_amount or 0),
            'cashback_percentage': tx.cashback_percentage,
            'created_at': tx.created_at.isoformat(),
        })

    return Response({
        'total_tomans': int(total_tomans),
        'count': total_count,
        'page': page,
        'total_pages': total_pages,
        'results': results,
    })
