from calendar import monthrange
from datetime import datetime, timedelta
import re

from django.db.models import Count, Max, Min, Sum
from django.db.models.functions import TruncDate
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.models import CustomerProfile, User
from packages.models import Package

from .models import CustomerLoyalty, EliteGiftClaim, Transaction
from .serializers import TransactionSerializer
from .transaction_utils import (
    PERIOD_LABELS,
    STATUS_LABELS,
    TYPE_LABELS,
    apply_transaction_filters,
    build_csv,
    build_pdf_html,
    build_xlsx,
    jalali_datetime_label,
    optimized_transactions,
    period_bounds,
    reference_code,
)


def _month_bounds(year, month):
    start = timezone.make_aware(datetime(year, month, 1, 0, 0, 0))
    last_day = monthrange(year, month)[1]
    end = timezone.make_aware(datetime(year, month, last_day, 23, 59, 59))
    return start, end


def _shift_month(year, month, delta):
    month += delta
    while month < 1:
        month += 12
        year -= 1
    while month > 12:
        month -= 12
        year += 1
    return year, month


def _mom_pct(current, previous):
    current = float(current or 0)
    previous = float(previous or 0)
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


def _clamp(value, low=0, high=100):
    return max(low, min(high, int(round(value))))


def _normalize_phone(raw):
    digits = re.sub(r'\D', '', str(raw or ''))
    if digits.startswith('98') and len(digits) >= 12:
        digits = '0' + digits[2:]
    if digits.startswith('9') and len(digits) == 10:
        digits = '0' + digits
    return digits


def _require_business(request):
    if request.user.role != 'business':
        return None, Response(
            {'error': 'فقط کسب‌وکار می‌تواند به این بخش دسترسی داشته باشد'},
            status=status.HTTP_403_FORBIDDEN,
        )
    try:
        return request.user.businessprofile, None
    except Exception:
        return None, Response(
            {'error': 'پروفایل کسب‌وکار یافت نشد'},
            status=status.HTTP_404_NOT_FOUND,
        )


def _approved_qs(business):
    return Transaction.objects.filter(business=business, status='approved')


def _period_sum(qs, start, end):
    return qs.filter(created_at__gte=start, created_at__lte=end).aggregate(
        total=Sum('final_amount'),
        count=Count('id'),
        customers=Count('customer', distinct=True),
    )


def _build_dashboard(business):
    now = timezone.localtime()
    today = now.date()
    this_start, this_end = _month_bounds(now.year, now.month)
    prev_year, prev_month = _shift_month(now.year, now.month, -1)
    prev_start, prev_end = _month_bounds(prev_year, prev_month)
    days_in_month = monthrange(now.year, now.month)[1]
    churn_cutoff = now - timedelta(days=30)

    approved = _approved_qs(business)
    all_tx = Transaction.objects.filter(business=business)
    loyalties = CustomerLoyalty.objects.filter(business=business).select_related('customer__user')

    this_stats = _period_sum(approved, this_start, this_end)
    prev_stats = _period_sum(approved, prev_start, prev_end)

    this_sales = float(this_stats['total'] or 0)
    prev_sales = float(prev_stats['total'] or 0)
    this_tx_count = int(this_stats['count'] or 0)
    prev_tx_count = int(prev_stats['count'] or 0)
    this_month_all_tx = all_tx.filter(created_at__gte=this_start, created_at__lte=this_end).count()
    prev_month_all_tx = all_tx.filter(created_at__gte=prev_start, created_at__lte=prev_end).count()

    first_last = approved.values('customer_id').annotate(
        first_at=Min('created_at'),
        last_at=Max('created_at'),
        tx_count=Count('id'),
        spent=Sum('final_amount'),
    )
    first_map = {row['customer_id']: row for row in first_last}

    new_ids = {
        cid for cid, row in first_map.items()
        if row['first_at'] and this_start <= row['first_at'] <= this_end
    }
    returning_ids = {
        cid for cid, row in first_map.items()
        if row['tx_count'] >= 2 and row['last_at'] and this_start <= row['last_at'] <= this_end
    }
    prev_returning_ids = {
        cid for cid, row in first_map.items()
        if row['tx_count'] >= 2 and row['last_at'] and prev_start <= row['last_at'] <= prev_end
    }
    active_ids = {
        cid for cid, row in first_map.items()
        if row['last_at'] and this_start <= row['last_at'] <= this_end
    }
    prev_active_ids = {
        cid for cid, row in first_map.items()
        if row['last_at'] and prev_start <= row['last_at'] <= prev_end
    }
    churn_ids = {
        cid for cid, row in first_map.items()
        if row['last_at'] and row['last_at'] < churn_cutoff and row['tx_count'] >= 1
    }
    vip_ids = set(
        loyalties.exclude(vip_status='none').values_list('customer_id', flat=True)
    )

    pending_tx = all_tx.filter(status='pending').count()
    pending_gifts = EliteGiftClaim.objects.filter(business=business, status='pending').count()

    packages = Package.objects.filter(business=business).order_by('-id')
    active_pkg = packages.filter(is_active=True, status='approved').first()
    current_pkg = active_pkg or packages.first()
    days_remaining = None
    if current_pkg and current_pkg.end_date:
        days_remaining = (current_pkg.end_date - today).days

    approved_this = approved.filter(created_at__gte=this_start, created_at__lte=this_end)
    approved_prev = approved.filter(created_at__gte=prev_start, created_at__lte=prev_end)
    decided_this = all_tx.filter(
        status__in=['approved', 'rejected'],
        modified_at__gte=this_start,
        modified_at__lte=this_end,
    )
    decided_prev = all_tx.filter(
        status__in=['approved', 'rejected'],
        modified_at__gte=prev_start,
        modified_at__lte=prev_end,
    )
    approval_rate_this = (
        decided_this.filter(status='approved').count() / decided_this.count() * 100
        if decided_this.exists() else 0
    )
    approval_rate_prev = (
        decided_prev.filter(status='approved').count() / decided_prev.count() * 100
        if decided_prev.exists() else 0
    )

    joined = business.user.date_joined.date()
    months_alive = max(1, (today.year - joined.year) * 12 + today.month - joined.month)
    months_with_sales = approved.dates('created_at', 'month').count()
    tenure_score = _clamp((months_alive / 12) * 55 + min(45, months_with_sales * 6))
    prev_tenure_score = _clamp(((max(1, months_alive - 1)) / 12) * 55 + min(45, max(0, months_with_sales - 1) * 6))

    engagement_score = 0
    if getattr(business, 'name', None):
        engagement_score += 12
    if getattr(business, 'address', None):
        engagement_score += 8
    if current_pkg:
        engagement_score += 18
        if current_pkg.is_complete:
            engagement_score += 12
        if current_pkg.is_active and current_pkg.status == 'approved':
            engagement_score += 15
        if hasattr(current_pkg, 'elite_gift'):
            engagement_score += 10
    engagement_score += min(25, int(approval_rate_this * 0.25))
    engagement_score = _clamp(engagement_score)
    prev_engagement = _clamp(
        (engagement_score - 8 if this_tx_count > 0 else engagement_score - 15) + min(25, int(approval_rate_prev * 0.25)) / 4
    )

    total_customers = loyalties.count() or len(first_map)
    retention_score = _clamp((len(returning_ids) / total_customers) * 100) if total_customers else 0
    prev_retention = _clamp((len(prev_returning_ids) / max(total_customers, 1)) * 100) if total_customers else 0

    if prev_sales == 0 and this_sales == 0:
        sales_score = 0
    elif prev_sales == 0:
        sales_score = 72
    else:
        sales_score = _clamp(50 + _mom_pct(this_sales, prev_sales) / 2)
    prev_sales_score = 50 if prev_sales > 0 else 0

    overall = _clamp(
        tenure_score * 0.20
        + engagement_score * 0.25
        + retention_score * 0.25
        + sales_score * 0.30
    )
    if overall >= 80:
        health_label = 'عالی'
    elif overall >= 60:
        health_label = 'خوب'
    elif overall >= 40:
        health_label = 'متوسط'
    else:
        health_label = 'ضعیف'

    daily_map = {
        row['day']: float(row['total'] or 0)
        for row in approved_this.annotate(day=TruncDate('created_at')).values('day').annotate(total=Sum('final_amount'))
        if row['day']
    }
    sales_series = []
    for day in range(1, days_in_month + 1):
        d = datetime(now.year, now.month, day).date()
        sales_series.append({
            'day': day,
            'label': str(day),
            'amount': daily_map.get(d, 0),
        })

    gift_block = {
        'enabled': False,
        'gift_name': '',
        'gift_type': None,
        'target': 0,
        'current': 0,
        'percent': 0,
        'new_claims': pending_gifts,
        'customers_on_path': 0,
    }
    package_info = None
    if current_pkg:
        discount_pct = 0
        cashback_pct = 0
        specific_title = ''
        specific_pct = 0
        try:
            discount_pct = float(current_pkg.discount_all.percentage or 0)
            cashback_pct = float(getattr(current_pkg.discount_all, 'cashback_percentage', 0) or 0)
        except Exception:
            pass
        try:
            specific_title = current_pkg.specific_discount.title
            specific_pct = float(current_pkg.specific_discount.percentage or 0)
        except Exception:
            pass
        package_info = {
            'id': current_pkg.id,
            'status': current_pkg.status,
            'is_active': current_pkg.is_active,
            'is_complete': current_pkg.is_complete,
            'days_remaining': days_remaining,
            'start_date': current_pkg.start_date,
            'end_date': current_pkg.end_date,
            'discount_percentage': discount_pct,
            'cashback_percentage': cashback_pct,
            'specific_title': specific_title,
            'specific_percentage': specific_pct,
        }
        if hasattr(current_pkg, 'elite_gift') and current_pkg.elite_gift:
            gift = current_pkg.elite_gift
            if gift.amount or gift.count:
                gift_qs = approved.filter(package=current_pkg)
                if gift.amount:
                    current_progress = float(gift_qs.aggregate(total=Sum('original_amount'))['total'] or 0)
                    target = float(gift.amount)
                    gift_type = 'amount'
                else:
                    current_progress = gift_qs.count()
                    target = float(gift.count or 0)
                    gift_type = 'count'
                percent = min(100, round((current_progress / target) * 100, 1)) if target else 0
                if gift.amount:
                    per_customer = gift_qs.values('customer_id').annotate(total=Sum('original_amount'))
                else:
                    per_customer = gift_qs.values('customer_id').annotate(total=Count('id'))
                on_path = 0
                for row in per_customer:
                    value = float(row['total'] or 0)
                    if 0 < value < target:
                        on_path += 1
                gift_block = {
                    'enabled': True,
                    'gift_name': gift.gift,
                    'gift_type': gift_type,
                    'target': target,
                    'current': current_progress,
                    'percent': percent,
                    'new_claims': pending_gifts,
                    'customers_on_path': on_path,
                }

    return {
        'today_label': today.isoformat(),
        'health': {
            'score': overall,
            'label': health_label,
            'metrics': [
                {
                    'key': 'tenure',
                    'title': 'سابقه فعالیت',
                    'score': tenure_score,
                    'change': _mom_pct(tenure_score, prev_tenure_score),
                    'detail': f'{months_alive} ماه حضور در فایدو و {months_with_sales} ماه فروش ثبت‌شده',
                },
                {
                    'key': 'engagement',
                    'title': 'تعامل با فایدو',
                    'score': engagement_score,
                    'change': _mom_pct(engagement_score, prev_engagement),
                    'detail': f'نرخ تایید تراکنش این ماه {round(approval_rate_this)}٪',
                },
                {
                    'key': 'retention',
                    'title': 'بازگشت مشتری',
                    'score': retention_score,
                    'change': _mom_pct(retention_score, prev_retention),
                    'detail': f'{len(returning_ids)} مشتری بازگشتی از {total_customers} مشتری',
                },
                {
                    'key': 'sales',
                    'title': 'عملکرد فروش',
                    'score': sales_score,
                    'change': _mom_pct(this_sales, prev_sales),
                    'detail': f'فروش این ماه نسبت به ماه قبل',
                },
            ],
        },
        'kpis': {
            'sales_this_month': this_sales,
            'sales_change': _mom_pct(this_sales, prev_sales),
            'active_customers': len(active_ids),
            'active_change': _mom_pct(len(active_ids), len(prev_active_ids)),
            'returning_customers': len(returning_ids),
            'returning_change': _mom_pct(len(returning_ids), len(prev_returning_ids)),
            'transactions_this_month': this_month_all_tx,
            'transactions_change': _mom_pct(this_month_all_tx, prev_month_all_tx),
        },
        'actions': {
            'pending_transactions': pending_tx,
            'pending_gift_claims': pending_gifts,
            'package_days_remaining': days_remaining,
            'package_status': current_pkg.status if current_pkg else None,
        },
        'customers_summary': {
            'new': len(new_ids),
            'returning': len(returning_ids),
            'vip': len(vip_ids),
            'churn_risk': len(churn_ids),
            'total': total_customers,
        },
        'sales_series': sales_series,
        'gift_program': gift_block,
        'package': package_info,
    }


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def business_dashboard(request):
    business, error = _require_business(request)
    if error:
        return error
    return Response(_build_dashboard(business))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def business_customers(request):
    business, error = _require_business(request)
    if error:
        return error

    now = timezone.localtime()
    this_start, this_end = _month_bounds(now.year, now.month)
    churn_cutoff = now - timedelta(days=30)
    segment = request.query_params.get('segment') or 'all'
    search = request.query_params.get('search') or ''

    loyalties = list(
        CustomerLoyalty.objects.filter(business=business).select_related('customer__user')
    )
    stats = {
        row['customer_id']: row
        for row in _approved_qs(business).values('customer_id').annotate(
            tx_count=Count('id'),
            spent=Sum('final_amount'),
            first_at=Min('created_at'),
            last_at=Max('created_at'),
        )
    }

    def build_row(loyalty):
        st = stats.get(loyalty.customer_id, {})
        first_at = st.get('first_at')
        last_at = st.get('last_at')
        tx_count = int(st.get('tx_count') or 0)
        segments = []
        if first_at and this_start <= first_at <= this_end:
            segments.append('new')
        if tx_count >= 2 and last_at and this_start <= last_at <= this_end:
            segments.append('returning')
        if loyalty.vip_status and loyalty.vip_status != 'none':
            segments.append('vip')
        if last_at and last_at < churn_cutoff and tx_count >= 1:
            segments.append('churn')
        user = loyalty.customer.user
        name = (user.get_full_name() or '').strip() or user.username
        phone = user.phone_number or ''
        return {
            'id': loyalty.id,
            'customer_id': loyalty.customer_id,
            'name': name,
            'phone': phone,
            'points': loyalty.points,
            'vip_status': loyalty.vip_status,
            'transaction_count': tx_count,
            'total_spent': float(st.get('spent') or 0),
            'first_purchase_at': first_at.isoformat() if first_at else None,
            'last_purchase_at': last_at.isoformat() if last_at else None,
            'segments': segments,
        }

    all_rows = [build_row(item) for item in loyalties]
    counts = {
        'all': len(all_rows),
        'new': sum(1 for row in all_rows if 'new' in row['segments']),
        'returning': sum(1 for row in all_rows if 'returning' in row['segments']),
        'vip': sum(1 for row in all_rows if 'vip' in row['segments']),
        'churn': sum(1 for row in all_rows if 'churn' in row['segments']),
    }

    rows = all_rows
    if search:
        needle = search.strip()
        phone_needle = _normalize_phone(needle)
        rows = [
            row for row in rows
            if needle in row['name'] or needle in row['phone'] or (phone_needle and phone_needle in _normalize_phone(row['phone']))
        ]
    if segment not in ('all', '', None):
        rows = [row for row in rows if segment in row['segments']]

    rows.sort(key=lambda item: item['last_purchase_at'] or '', reverse=True)

    customer_id = request.query_params.get('customer_id')
    detail = None
    if customer_id:
        txs = Transaction.objects.filter(
            business=business, customer_id=customer_id
        ).order_by('-created_at')[:20]
        detail = TransactionSerializer(txs, many=True).data

    return Response({'results': rows, 'counts': counts, 'transactions': detail})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def business_create_transaction(request):
    business, error = _require_business(request)
    if error:
        return error

    phone = _normalize_phone(request.data.get('phone') or request.data.get('phone_number'))
    if not phone:
        return Response({'error': 'شماره موبایل مشتری الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = int(str(request.data.get('original_amount') or '0').replace(',', ''))
    except (TypeError, ValueError):
        amount = 0
    if amount <= 0:
        return Response({'error': 'مبلغ فاکتور باید بیشتر از صفر باشد'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(phone_number=phone, role='customer').first()
    if not user:
        user = User.objects.filter(phone_number=phone).first()
    if not user:
        return Response({'error': 'مشتری با این شماره یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    try:
        customer = user.customerprofile
    except Exception:
        return Response({'error': 'پروفایل مشتری یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

    package = Package.objects.filter(business=business, is_active=True, status='approved').first()
    if not package:
        return Response({'error': 'برای ثبت تراکنش باید پکیج فعال داشته باشید'}, status=status.HTTP_400_BAD_REQUEST)
    if not hasattr(package, 'discount_all'):
        return Response({'error': 'پکیج فعال تنظیمات تخفیف ندارد'}, status=status.HTTP_400_BAD_REQUEST)

    has_special = bool(request.data.get('has_special_discount'))
    special_amount = 0
    special_title = ''
    if has_special:
        if not hasattr(package, 'specific_discount'):
            return Response({'error': 'این پکیج تخفیف اختصاصی ندارد'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            special_amount = int(str(request.data.get('special_discount_original_amount') or '0').replace(',', ''))
        except (TypeError, ValueError):
            special_amount = 0
        if special_amount <= 0:
            return Response({'error': 'مبلغ تخفیف اختصاصی الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        special_title = package.specific_discount.title

    loyalty, _ = CustomerLoyalty.objects.get_or_create(customer=customer, business=business)
    transaction = Transaction.objects.create(
        customer=customer,
        business=business,
        package=package,
        loyalty=loyalty,
        original_amount=amount,
        has_special_discount=has_special,
        special_discount_title=special_title or None,
        special_discount_original_amount=special_amount,
        note=request.data.get('note') or 'ثبت توسط کسب‌وکار',
    )
    auto_approve = str(request.data.get('auto_approve', 'true')).lower() in ('1', 'true', 'yes')
    if auto_approve:
        transaction.approve()

    return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)


def _business_transaction_qs(business, params):
    qs = optimized_transactions(Transaction.objects.filter(business=business))
    return apply_transaction_filters(qs, params)


def _export_row(transaction):
    discount = float(transaction.discount_all_amount or 0) + float(transaction.special_discount_amount or 0)
    phone = transaction.customer.user.phone_number or ''
    digits = ''.join(ch for ch in phone if ch.isdigit())
    if len(digits) >= 8:
        masked = f'{digits[:4]} *** {digits[-4:]}'
    else:
        masked = phone
    name = (transaction.customer.user.get_full_name() or '').strip() or transaction.customer.user.username
    return {
        'reference': reference_code(transaction),
        'created_label': jalali_datetime_label(transaction.created_at),
        'customer_name': name,
        'customer_phone': masked,
        'type_label': TYPE_LABELS.get(transaction.transaction_type, transaction.transaction_type or 'عادی'),
        'status_label': STATUS_LABELS.get(transaction.status, transaction.status),
        'original_amount': int(transaction.original_amount or 0),
        'discount_amount': int(discount),
        'cashback_amount': int(transaction.cashback_amount or 0),
        'final_amount': int(transaction.final_amount or 0),
        'points_earned': int(transaction.points_earned or 0),
    }


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def business_transactions_summary(request):
    business, error = _require_business(request)
    if error:
        return error

    params = request.query_params.copy()
    if not params.get('period') and not params.get('date_from'):
        params['period'] = 'today'
    start, end, period = period_bounds(params)
    qs = _business_transaction_qs(business, params)
    approved = qs.filter(status='approved')
    totals = approved.aggregate(
        sales=Sum('final_amount'),
        cashback=Sum('cashback_amount'),
        discount=Sum('discount_all_amount'),
        special=Sum('special_discount_amount'),
        success_count=Count('id'),
    )
    return Response({
        'period': period or 'today',
        'period_label': PERIOD_LABELS.get(period or 'today', 'خلاصه'),
        'date_from': start.date().isoformat() if start else None,
        'date_to': end.date().isoformat() if end else None,
        'sales': float(totals['sales'] or 0),
        'cashback': float(totals['cashback'] or 0),
        'discount': float(totals['discount'] or 0) + float(totals['special'] or 0),
        'success_count': int(totals['success_count'] or 0),
        'total_count': qs.count(),
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def business_transactions_export(request):
    business, error = _require_business(request)
    if error:
        return error

    fmt = (request.query_params.get('export_format') or request.query_params.get('file_format') or request.query_params.get('output') or 'csv').lower()
    if fmt not in ('csv', 'xlsx', 'xls', 'pdf', 'excel'):
        return Response({'error': 'فرمت خروجی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
    if fmt in ('xls', 'excel'):
        fmt = 'xlsx'

    qs = _business_transaction_qs(business, request.query_params).order_by('-created_at')[:5000]
    rows = [_export_row(item) for item in qs]
    stamp = timezone.localdate().isoformat()

    if fmt == 'csv':
        response = HttpResponse(build_csv(rows), content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="faydo-transactions-{stamp}.csv"'
        return response
    if fmt == 'xlsx':
        response = HttpResponse(
            build_xlsx(rows),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = f'attachment; filename="faydo-transactions-{stamp}.xlsx"'
        return response

    response = HttpResponse(build_pdf_html(rows), content_type='text/html; charset=utf-8')
    response['Content-Disposition'] = f'inline; filename="faydo-transactions-{stamp}.html"'
    return response
