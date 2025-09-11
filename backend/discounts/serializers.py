from rest_framework import serializers
from django.utils import timezone
from .models import Discount, DiscountScore, DiscountComment, DiscountReport
from accounts.models import BusinessProfile, CustomerProfile


class DiscountSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    average_score = serializers.SerializerMethodField()
    total_scores = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    can_comment = serializers.SerializerMethodField()
    user_score = serializers.SerializerMethodField()
    user_comment = serializers.SerializerMethodField()

    class Meta:
        model = Discount
        fields = [
            'id', 'title', 'description', 'percentage', 'start_date', 'end_date',
            'business', 'business_name', 'average_score', 'total_scores', 
            'is_active', 'time_remaining', 'can_comment', 'user_score', 
            'user_comment', 'created_at', 'modified_at'
        ]
        read_only_fields = ['id', 'created_at', 'modified_at', 'business']

    def get_average_score(self, obj):
        scores = obj.scores.all()
        if scores.exists():
            return round(sum(score.score for score in scores) / len(scores), 1)
        return 0

    def get_total_scores(self, obj):
        return obj.scores.count()

    def get_is_active(self, obj):
        now = timezone.now()
        return obj.start_date <= now <= obj.end_date and not obj.is_deleted

    def get_time_remaining(self, obj):
        now = timezone.now()
        if obj.end_date <= now:
            return 0
        total_duration = (obj.end_date - obj.start_date).total_seconds()
        remaining_duration = (obj.end_date - now).total_seconds()
        if total_duration > 0:
            return max(0, min(100, (remaining_duration / total_duration) * 100))
        return 0

    def get_can_comment(self, obj):
        # فرض بر این است که کاربر باید از تخفیف استفاده کرده باشد
        # این منطق را می‌توان بر اساس نیازمندی‌های پروژه تغییر داد
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                customer = request.user.customerprofile
                # چک کنید که آیا کاربر قبلاً از این تخفیف استفاده کرده یا نه
                # فعلاً True برمی‌گردانیم
                return True
            except:
                return False
        return False

    def get_user_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                customer = request.user.customerprofile
                score = obj.scores.filter(user=customer).first()
                return score.score if score else None
            except:
                return None
        return None

    def get_user_comment(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                customer = request.user.customerprofile
                comment = obj.comments.filter(user=customer, is_deleted=False).first()
                return comment.comment if comment else None
            except:
                return None
        return None

    def validate(self, data):
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "تاریخ پایان باید بعد از تاریخ شروع باشد."
                )
        return data


class DiscountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['title', 'description', 'percentage', 'start_date', 'end_date']

    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError(
                "تاریخ پایان باید بعد از تاریخ شروع باشد."
            )
        return data

    def create(self, validated_data):
        request = self.context['request']
        business = request.user.businessprofile
        validated_data['business'] = business
        return super().create(validated_data)


class DiscountScoreSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.get_full_name', read_only=True)

    class Meta:
        model = DiscountScore
        fields = ['id', 'score', 'user_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

    def create(self, validated_data):
        request = self.context['request']
        customer = request.user.customerprofile
        validated_data['user'] = customer
        return super().create(validated_data)


class DiscountCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.get_full_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.user.image', read_only=True)

    class Meta:
        model = DiscountComment
        fields = ['id', 'comment', 'user_name', 'user_avatar', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

    def create(self, validated_data):
        request = self.context['request']
        customer = request.user.customerprofile
        validated_data['user'] = customer
        return super().create(validated_data)


class DiscountReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountReport
        fields = ['id', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

    def create(self, validated_data):
        request = self.context['request']
        customer = request.user.customerprofile
        validated_data['user'] = customer
        return super().create(validated_data)


class DiscountSummarySerializer(serializers.ModelSerializer):
    """برای نمایش خلاصه در داشبورد کسب‌وکار"""
    average_score = serializers.SerializerMethodField()
    total_scores = serializers.SerializerMethodField()
    total_comments = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Discount
        fields = [
            'id', 'title', 'percentage', 'start_date', 'end_date',
            'average_score', 'total_scores', 'total_comments', 'is_active'
        ]

    def get_average_score(self, obj):
        scores = obj.scores.all()
        if scores.exists():
            return round(sum(score.score for score in scores) / len(scores), 1)
        return 0

    def get_total_scores(self, obj):
        return obj.scores.count()

    def get_total_comments(self, obj):
        return obj.comments.filter(is_deleted=False).count()

    def get_is_active(self, obj):
        now = timezone.now()
        return obj.start_date <= now <= obj.end_date and not obj.is_deleted


class RecentCommentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='user.user.get_full_name', read_only=True)
    customer_username = serializers.CharField(source='user.user.username', read_only=True)
    discount_title = serializers.CharField(source='discount.title', read_only=True)
    discount_id = serializers.IntegerField(source='discount.id', read_only=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)
    rating = serializers.SerializerMethodField()

    class Meta:
        model = DiscountComment
        fields = [
            'id', 'comment', 'customer_name', 'customer_username', 
            'discount_title', 'discount_id', 'date', 'rating'
        ]

    def get_rating(self, obj):
        # گرفتن امتیاز کاربر برای این تخفیف
        try:
            score = obj.discount.scores.filter(user=obj.user).first()
            return score.score if score else 0
        except:
            return 0