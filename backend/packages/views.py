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
from accounts.models import BusinessProfile


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
            return Package.objects.filter(is_active=True, status='approved', is_complete=True)
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

        payload = {"gift": gift}
        if amount:
            payload["amount"] = amount
            payload["count"] = None
        if count:
            payload["count"] = count
            if "amount" in payload:
                payload.pop("amount", None)

        if hasattr(package, 'elite_gift'):
            eg = package.elite_gift
            for k, v in payload.items():
                setattr(eg, k, v)
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
        Payload example: {"experience_ids": [1,2,3]}
        Must include at least one experience with vip_type = 'VIP'.
        """
        package = self.get_object()
        ids = request.data.get('experience_ids', [])
        if not isinstance(ids, list) or len(ids) == 0:
            return Response({"error": "حداقل یک گزینه VIP باید انتخاب شود."}, status=status.HTTP_400_BAD_REQUEST)

        categories = VipExperienceCategory.objects.filter(id__in=ids)
        if not categories.filter(vip_type='VIP').exists():
            return Response({"error": "حداقل یک گزینه از گروه VIP الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        # Replace selections
        package.experiences.all().delete()
        for c in categories:
            VipExperience.objects.create(package=package, vip_experience_category=c)

        # بررسی کامل بودن پکیج
        package.save()

        return Response({"message": "گزینه‌های VIP ذخیره شد."})

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
                    "vip_type": exp.vip_experience_category.vip_type
                }
                for exp in package.experiences.all()
            ]
        })


class VipExperienceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for reading VIP experience categories filtered by business category
    """
    serializer_class = VipExperienceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter VIP experiences based on business category
        """
        user = self.request.user
        
        if user.role == 'business':
            try:
                business_profile = user.businessprofile
                # Get business category
                business_category = business_profile.category
                if business_category:
                    return VipExperienceCategory.objects.filter(category=business_category).order_by('id')
                else:
                    return VipExperienceCategory.objects.none()
            except BusinessProfile.DoesNotExist:
                return VipExperienceCategory.objects.none()
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            # Admin users can see all VIP experiences
            return VipExperienceCategory.objects.all().order_by('id')
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

