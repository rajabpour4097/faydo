from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
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
                serializer.save(business=business_profile)
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
        
        package.is_active = not package.is_active
        package.save()
        
        return Response({
            'id': package.id,
            'is_active': package.is_active,
            'message': f'Package {"activated" if package.is_active else "deactivated"} successfully'
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a package (admin only)
        """
        if self.request.user.role not in ['admin', 'it_manager', 'project_manager']:
            return Response(
                {"error": "Only administrators can approve packages"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        package = self.get_object()
        package.status = 'approved'
        package.save()
        
        return Response({
            'id': package.id,
            'status': package.status,
            'message': 'Package approved successfully'
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


class VipExperienceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for reading VIP experience categories
    """
    queryset = VipExperienceCategory.objects.all()
    serializer_class = VipExperienceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


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