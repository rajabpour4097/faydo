from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.contrib.contenttypes.models import ContentType
from .models import (
    Package, DiscountAll, SpecificDiscount, EliteGift, 
    VipExperienceCategory, VipExperience, Comment, CommentLike
)
from .serializers import (
    PackageListSerializer, PackageDetailSerializer, PackageCreateUpdateSerializer,
    VipExperienceCategorySerializer, CommentSerializer, CommentCreateSerializer
)
from accounts.models import BusinessProfile, Club
from .club_utils import (
    resolve_business_club,
    resolve_canonical_club,
    club_ids_for_lookup,
    infer_club_from_category_name,
)


class PackageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing packages
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter packages based on user role and business
        """
        user = self.request.user
        
        if user.role == 'business':
            try:
                business_profile = user.businessprofile
                return Package.objects.filter(business=business_profile)
            except BusinessProfile.DoesNotExist:
                return Package.objects.none()
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return Package.objects.all()
        elif user.role == 'customer':
            return Package.objects.filter(
                is_active=True, status='approved', is_complete=True
            ).select_related('business', 'business__user').prefetch_related('business__gallery_images')
        else:
            return Package.objects.none()
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action
        """
        if self.action == 'list':
            return PackageListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PackageCreateUpdateSerializer
        else:
            return PackageDetailSerializer
    
    def perform_create(self, serializer):
        """
        Set the business profile for the package
        """
        user = self.request.user
        if user.role == 'business':
            try:
                business_profile = user.businessprofile
                
                # Creation guardrails: block if there is a draft package
                draft_exists = Package.objects.filter(
                    business=business_profile, status='draft'
                ).exists()
                if draft_exists:
                    raise Response(
                        {"error": "شما پکیج پیش‌نویس دارید و نمی‌توانید پکیج جدید بسازید."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                
                # Creation guardrails: block if there is a pending package under review
                pending_exists = Package.objects.filter(
                    business=business_profile, status='pending', is_complete=True
                ).exists()
                if pending_exists:
                    raise Response(
                        {"error": "پکیج در حال بررسی دارید و نمی‌توانید پکیج جدید بسازید."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Allow creating a new package if no active package OR active package ends within 10 days
                active_pkg = (
                    Package.objects.filter(business=business_profile, is_active=True)
                    .order_by('-end_date')
                    .first()
                )
                if active_pkg and active_pkg.end_date:
                    days_left = (active_pkg.end_date - timezone.now().date()).days
                    if days_left > 10:
                        raise Response(
                            {"error": "پکیج فعالی دارید و بیش از ۱۰ روز تا پایان آن مانده است."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                # ایجاد پکیج ناتمام (is_complete=False)
                serializer.save(business=business_profile, is_complete=False, status='draft')
            except BusinessProfile.DoesNotExist:
                raise Response(
                    {"error": "Business profile not found"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # For admin users, business should be provided in the request
            serializer.save()
    
    def perform_update(self, serializer):
        """
        Ensure only the business owner or admin can update
        Business users can only edit packages with 'pending' status
        """
        user = self.request.user
        package = self.get_object()
        
        if user.role == 'business':
            try:
                business_profile = user.businessprofile
                if package.business != business_profile:
                    raise Response(
                        {"error": "You can only update your own packages"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # کسب‌وکارها فقط می‌توانند پکیج‌های با وضعیت 'pending' را ویرایش کنند
                if package.status != 'pending':
                    raise Response(
                        {"error": "فقط پکیج‌های در حال بررسی قابل ویرایش هستند"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                    
            except BusinessProfile.DoesNotExist:
                raise Response(
                    {"error": "Business profile not found"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Ensure only the business owner or admin can delete
        """
        user = self.request.user
        package = self.get_object()
        
        if user.role == 'business':
            try:
                business_profile = user.businessprofile
                if package.business != business_profile:
                    raise Response(
                        {"error": "You can only delete your own packages"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except BusinessProfile.DoesNotExist:
                raise Response(
                    {"error": "Business profile not found"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle package active status
        """
        package = self.get_object()
        user = self.request.user
        
        # Check permissions
        if user.role == 'business':
            try:
                business_profile = user.businessprofile
                if package.business != business_profile:
                    return Response(
                        {"error": "You can only modify your own packages"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except BusinessProfile.DoesNotExist:
                return Response(
                    {"error": "Business profile not found"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # If activating, deactivate other active packages for the same business
        if not package.is_active:
            Package.objects.filter(business=package.business, is_active=True).exclude(id=package.id).update(is_active=False)
            package.is_active = True
        else:
            package.is_active = False
        package.save()
        
        return Response({
            'id': package.id,
            'is_active': package.is_active,
            'message': f'Package {"activated" if package.is_active else "deactivated"} successfully'
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a package (admin only) with automatic activation logic
        """
        if self.request.user.role not in ['admin', 'it_manager', 'project_manager']:
            return Response(
                {"error": "Only administrators can approve packages"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        package = self.get_object()
        package.status = 'approved'
        
        # بررسی منطق فعال‌سازی خودکار
        activation_message = ""
        
        if package.can_activate_immediately():
            # اگر اولین پکیج کسب‌وکار است یا پکیج فعالی وجود ندارد
            package.activate_package()
            activation_message = "پکیج تایید و فوراً فعال شد."
        else:
            # اگر پکیج فعالی وجود دارد که کمتر از ۱۰ روز به پایان آن مانده
            package.is_active = False
            activation_message = "پکیج تایید شد اما تا پایان پکیج فعلی فعال نخواهد شد. پس از پایان پکیج فعلی، این پکیج به صورت خودکار فعال می‌شود."
        
        package.save()
        
        return Response({
            'id': package.id,
            'status': package.status,
            'is_active': package.is_active,
            'message': f'Package approved successfully. {activation_message}'
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a package (admin only)
        """
        if self.request.user.role not in ['admin', 'it_manager', 'project_manager']:
            return Response(
                {"error": "Only administrators can reject packages"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        package = self.get_object()
        package.status = 'rejected'
        package.save()
        
        return Response({
            'id': package.id,
            'status': package.status,
            'message': 'Package rejected successfully'
        })

    @action(detail=True, methods=['post'])
    def discounts(self, request, pk=None):
        """
        Create or update discounts for step 1 (mandatory DiscountAll, optional SpecificDiscount).
        Payload example:
        {
          "discount_all": {"percentage": 15},
          "specific_discount": {"title": "...", "description": "...", "percentage": 25},
          "remove_specific": false
        }
        """
        package = self.get_object()

        discount_all_data = request.data.get('discount_all')
        specific_data = request.data.get('specific_discount')
        remove_specific = request.data.get('remove_specific', False)

        # Validate mandatory DiscountAll
        if not discount_all_data or 'percentage' not in discount_all_data:
            return Response({"error": "درصد تخفیف کلی الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        # Upsert DiscountAll
        if hasattr(package, 'discount_all'):
            package.discount_all.percentage = discount_all_data['percentage']
            package.discount_all.save()
        else:
            DiscountAll.objects.create(package=package, percentage=discount_all_data['percentage'])
        
        # بررسی کامل بودن پکیج
        package.save()  # این کار check_completion را فراخوانی می‌کند

        # Handle SpecificDiscount removal
        if remove_specific:
            if hasattr(package, 'specific_discount'):
                package.specific_discount.delete()
        else:
            if specific_data and (specific_data.get('title')):
                # Validate percentage presence and greater than DiscountAll
                if 'percentage' not in specific_data:
                    return Response({"error": "درصد تخفیف اختصاصی الزامی است."}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    all_percent = float(package.discount_all.percentage)
                    spec_percent = float(specific_data['percentage'])
                except Exception:
                    return Response({"error": "مقادیر درصد نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)
                if spec_percent <= all_percent:
                    return Response({"error": "درصد تخفیف اختصاصی باید از تخفیف کلی بیشتر باشد."}, status=status.HTTP_400_BAD_REQUEST)

                if hasattr(package, 'specific_discount'):
                    sd = package.specific_discount
                    sd.title = specific_data.get('title')
                    sd.description = specific_data.get('description')
                    sd.percentage = spec_percent
                    sd.save()
                else:
                    SpecificDiscount.objects.create(
                        package=package,
                        title=specific_data.get('title'),
                        description=specific_data.get('description'),
                        percentage=spec_percent,
                    )

        return Response({"message": "تخفیفات با موفقیت ذخیره شد."})

    @action(detail=True, methods=['post'])
    def loyal_gift(self, request, pk=None):
        """
        Create or update EliteGift for step 2 (mandatory to choose one method and gift text)
        Payload example:
        {"gift": "کارت هدیه", "amount": 1000000}  or  {"gift": "...", "count": 5}
        """
        package = self.get_object()
        gift = request.data.get('gift')
        amount = request.data.get('amount')
        count = request.data.get('count')

        if not gift:
            return Response({"error": "فیلد هدیه الزامی است."}, status=status.HTTP_400_BAD_REQUEST)
        if not amount and not count:
            return Response({"error": "باید یکی از فیلدهای مبلغ یا تعداد را وارد کنید."}, status=status.HTTP_400_BAD_REQUEST)

        # تعیین نوع هدیه و پاک کردن فیلد مخالف
        if amount:
            # اگر مبلغ انتخاب شده، تعداد را پاک کن
            payload = {"gift": gift, "amount": amount, "count": None}
        else:
            # اگر تعداد انتخاب شده، مبلغ را پاک کن
            payload = {"gift": gift, "amount": None, "count": count}

        if hasattr(package, 'elite_gift'):
            eg = package.elite_gift
            # به‌روزرسانی تمام فیلدها (شامل پاک کردن فیلد مخالف)
            eg.gift = payload["gift"]
            eg.amount = payload["amount"]
            eg.count = payload["count"]
            eg.save()
        else:
            EliteGift.objects.create(package=package, **payload)

        # بررسی کامل بودن پکیج
        package.save()

        return Response({"message": "هدیه مشتریان وفادار ذخیره شد."})

    @action(detail=True, methods=['post'])
    def vip(self, request, pk=None):
        """
        Save VIP experiences for step 3.
        New payload format:
        {
          "experiences": [
            {"category_id": <int>, "description": "<str>"},
            {"category_id": <int>, "description": "<str>"}
          ]
        }
        Exactly one entry for vip_type='VIP' (طلایی) is required; VIP+ is optional.
        """
        package = self.get_object()
        experiences_data = request.data.get('experiences', [])

        if not isinstance(experiences_data, list) or len(experiences_data) == 0:
            return Response({"error": "بخش طلایی الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate entries
        for entry in experiences_data:
            if not entry.get('category_id'):
                return Response({"error": "شناسه دسته‌بندی الزامی است."}, status=status.HTTP_400_BAD_REQUEST)
            if not entry.get('description', '').strip():
                return Response({"error": "توضیحات هر بخش الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        category_ids = [e['category_id'] for e in experiences_data]
        categories_map = {c.id: c for c in VipExperienceCategory.objects.filter(id__in=category_ids)}

        has_gold = any(
            categories_map.get(e['category_id']) and categories_map[e['category_id']].vip_type == 'VIP'
            for e in experiences_data
        )

        if not has_gold:
            return Response({"error": "انتخاب یک گزینه از بخش طلایی الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        package.experiences.all().delete()
        for entry in experiences_data:
            cat = categories_map.get(entry['category_id'])
            if cat:
                VipExperience.objects.create(
                    package=package,
                    vip_experience_category=cat,
                    description=entry.get('description', '').strip()
                )

        package.save()

        return Response({"message": "گزینه‌های طلایی و VIP ذخیره شدند."})

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """
        Finalize package: set duration (months) and agree flag, then mark complete and pending.
        Payload example: {"duration_months": 3, "agree": true}
        """
        package = self.get_object()
        duration_months = int(request.data.get('duration_months', 0))
        agree = bool(request.data.get('agree', False))

        if not agree:
            return Response({"error": "پذیرش قوانین الزامی است."}, status=status.HTTP_400_BAD_REQUEST)
        if duration_months not in [3, 6, 9, 12]:
            return Response({"error": "مدت زمان نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)

        # تعیین تاریخ شروع بر اساس وجود پکیج فعال
        active_package = package.get_active_package_for_business()
        if active_package and active_package.end_date:
            # اگر پکیج فعالی وجود دارد، تاریخ شروع را تاریخ پایان پکیج فعلی قرار بده
            start = active_package.end_date
        else:
            # اگر پکیج فعالی وجود ندارد، تاریخ شروع را امروز قرار بده
            start = timezone.now().date()
        
        # approximate month addition by days (30) to avoid external libs
        end = start + timedelta(days=duration_months * 30)

        package.start_date = start
        package.end_date = end
        package.is_complete = True
        package.is_active = False
        package.status = 'pending'
        package.save()

        return Response({
            "message": "پکیج ثبت شد و در انتظار بررسی است.",
            "id": package.id,
            "start_date": package.start_date,
            "end_date": package.end_date,
            "status": package.status,
        })

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        دریافت وضعیت پکیج و مراحل تکمیل شده
        """
        package = self.get_object()
        
        return Response({
            "id": package.id,
            "is_complete": package.is_complete,
            "status": package.status,
            "has_discount_all": hasattr(package, 'discount_all'),
            "has_elite_gift": hasattr(package, 'elite_gift'),
            "has_vip_experiences": package.experiences.exists(),
            "has_dates": bool(package.start_date and package.end_date),
            "discount_all": package.discount_all.percentage if hasattr(package, 'discount_all') else None,
            "specific_discount": {
                "title": package.specific_discount.title,
                "percentage": package.specific_discount.percentage,
                "description": package.specific_discount.description
            } if hasattr(package, 'specific_discount') else None,
            "elite_gift": {
                "gift": package.elite_gift.gift,
                "amount": package.elite_gift.amount,
                "count": package.elite_gift.count
            } if hasattr(package, 'elite_gift') else None,
            "vip_experiences": [
                {
                    "id": exp.vip_experience_category.id,
                    "name": exp.vip_experience_category.name,
                    "vip_type": exp.vip_experience_category.vip_type,
                    "description": exp.description or ""
                }
                for exp in package.experiences.all()
            ]
        })
    
    @action(detail=False, methods=['get'], url_path='business/(?P<business_id>[^/.]+)/comments')
    def business_comments(self, request, business_id=None):
        """
        دریافت تمام نظرات مربوط به یک کسب‌وکار
        """
        try:
            # Get all packages of this business
            packages = Package.objects.filter(business_id=business_id)
            
            # Collect all comments from different package components
            all_comments = []
            
            for package in packages:
                # Comments from DiscountAll
                if hasattr(package, 'discount_all'):
                    discount_all_ct = ContentType.objects.get_for_model(DiscountAll)
                    comments = Comment.objects.filter(
                        content_type=discount_all_ct,
                        object_id=package.discount_all.id
                    )
                    for comment in comments:
                        all_comments.append({
                            'comment': comment,
                            'category': 'discount_all'
                        })
                
                # Comments from SpecificDiscount
                if hasattr(package, 'specific_discount'):
                    specific_discount_ct = ContentType.objects.get_for_model(SpecificDiscount)
                    comments = Comment.objects.filter(
                        content_type=specific_discount_ct,
                        object_id=package.specific_discount.id
                    )
                    for comment in comments:
                        all_comments.append({
                            'comment': comment,
                            'category': 'specific_discount'
                        })
                
                # Comments from EliteGift
                if hasattr(package, 'elite_gift'):
                    elite_gift_ct = ContentType.objects.get_for_model(EliteGift)
                    comments = Comment.objects.filter(
                        content_type=elite_gift_ct,
                        object_id=package.elite_gift.id
                    )
                    for comment in comments:
                        all_comments.append({
                            'comment': comment,
                            'category': 'elite_gift'
                        })
                
                # Comments from VipExperience
                for vip_exp in package.experiences.all():
                    vip_experience_ct = ContentType.objects.get_for_model(VipExperience)
                    comments = Comment.objects.filter(
                        content_type=vip_experience_ct,
                        object_id=vip_exp.id
                    )
                    for comment in comments:
                        all_comments.append({
                            'comment': comment,
                            'category': 'vip_experience'
                        })
            
            # Sort by creation date (newest first)
            all_comments.sort(key=lambda x: x['comment'].created_at, reverse=True)
            
            # Serialize comments
            user = request.user
            customer_profile = None
            if user.is_authenticated and user.role == 'customer':
                try:
                    customer_profile = user.customerprofile
                except:
                    pass
            
            serialized_comments = []
            for item in all_comments:
                comment = item['comment']
                is_liked = False
                if customer_profile:
                    is_liked = CommentLike.objects.filter(
                        comment=comment,
                        user=customer_profile
                    ).exists()
                
                serialized_comments.append({
                    'id': comment.id,
                    'user_name': comment.user.user.get_full_name() if hasattr(comment.user, 'user') else str(comment.user),
                    'user_avatar': '',
                    'content': comment.text or '',
                    'score': comment.score,
                    'service_type': comment.service_type or item['category'],  # استفاده از service_type یا category
                    'likes_count': comment.likes.count(),
                    'is_liked': is_liked,
                    'category': item['category'],
                    'created_at': comment.created_at.isoformat()
                })
            
            return Response(serialized_comments)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class VipExperienceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for reading VIP experience categories.
    - Business: filtered by their own service category
    - Customer: filtered by club_id query param (?club_id=X)
    - Admin/Manager: all
    """
    serializer_class = VipExperienceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def _club_items(self, base_qs, club):
        if not club:
            return base_qs.none()
        lookup_ids = club_ids_for_lookup(club)
        return base_qs.filter(
            club_id__in=lookup_ids, category__isnull=True
        ).order_by('vip_type', 'id')

    def get_queryset(self):
        user = self.request.user
        base_qs = VipExperienceCategory.objects.select_related(
            'category', 'category__club', 'club'
        )
        club_id_param = self.request.query_params.get('club_id')

        if user.role == 'business':
            try:
                business_profile = BusinessProfile.objects.select_related(
                    'category',
                    'category__club',
                    'category__parent',
                    'category__parent__club',
                    'category__parent__parent',
                    'category__parent__parent__club',
                ).get(user=user)
                business_category = business_profile.category
            except BusinessProfile.DoesNotExist:
                business_profile = None
                business_category = None

            business_club = resolve_business_club(business_profile)

            if club_id_param:
                club = Club.objects.filter(pk=club_id_param).first()
                if club:
                    club_qs = self._club_items(base_qs, club)
                    if club_qs.exists():
                        return club_qs

            if business_category:
                specific = base_qs.filter(category=business_category)
                if specific.exists():
                    return specific.order_by('vip_type', 'id')

            if business_club:
                club_qs = self._club_items(base_qs, business_club)
                if club_qs.exists():
                    return club_qs

            if business_category:
                inferred = infer_club_from_category_name(business_category)
                if inferred:
                    club_qs = self._club_items(base_qs, resolve_canonical_club(inferred))
                    if club_qs.exists():
                        return club_qs

            universal = base_qs.filter(category__isnull=True, club__isnull=True)
            if universal.exists():
                return universal.order_by('vip_type', 'id')

            return base_qs.none()

        elif user.role == 'customer':
            if club_id_param:
                club = Club.objects.filter(pk=club_id_param).first()
                club_qs = self._club_items(base_qs, club)
                if club_qs.exists():
                    return club_qs

                legacy = base_qs.filter(category__club_id=club_id_param)
                if legacy.exists():
                    return legacy.order_by('vip_type', 'id')

            universal = base_qs.filter(category__isnull=True, club__isnull=True)
            if universal.exists():
                return universal.order_by('vip_type', 'id')

            return base_qs.filter(category__isnull=True, club__isnull=False).order_by('vip_type', 'id')

        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return base_qs.all().order_by('vip_type', 'id')

        else:
            return VipExperienceCategory.objects.none()


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing comments on packages and related objects
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter comments based on content type and object id
        """
        content_type_id = self.request.query_params.get('content_type_id')
        object_id = self.request.query_params.get('object_id')
        
        if content_type_id and object_id:
            content_type = get_object_or_404(ContentType, id=content_type_id)
            return Comment.objects.filter(
                content_type=content_type,
                object_id=object_id
            )
        
        return Comment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        """
        Set the user for the comment
        """
        user = self.request.user
        try:
            customer_profile = user.customerprofile
            serializer.save(user=customer_profile)
        except:
            raise Response(
                {"error": "Customer profile not found"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """
        Like or unlike a comment
        """
        comment = self.get_object()
        user = self.request.user
        
        try:
            customer_profile = user.customerprofile
            like, created = CommentLike.objects.get_or_create(
                comment=comment,
                user=customer_profile
            )
            
            if not created:
                like.delete()
                message = 'Comment unliked'
                is_liked = False
            else:
                message = 'Comment liked'
                is_liked = True
            
            return Response({
                'is_liked': is_liked,
                'likes_count': comment.likes.count(),
                'message': message
            })
        except:
            return Response(
                {"error": "Customer profile not found"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

