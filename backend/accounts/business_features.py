"""Read and write business amenities and working hours."""

from datetime import time

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from accounts.amenity_utils import get_amenities_for_business, get_amenities_for_category, get_business_type_label
from accounts.models import BusinessAmenity, BusinessWorkingHours


def amenities_payload(amenities_qs, business_type, selected_ids):
    from accounts.serializers import AmenitySerializer

    selected_ids = set(selected_ids)
    general = []
    specific = []
    for amenity in amenities_qs:
        item = AmenitySerializer(amenity).data
        item['is_selected'] = amenity.id in selected_ids
        if amenity.business_type == 'general':
            general.append(item)
        else:
            specific.append(item)
    return {
        'business_type': business_type,
        'business_type_label': get_business_type_label(business_type),
        'general_amenities': general,
        'specific_amenities': specific,
        'selected_amenity_ids': list(selected_ids),
        'is_configured': bool(selected_ids),
    }


def amenities_payload_for_business(business):
    amenities_qs, business_type = get_amenities_for_business(business)
    selected_ids = business.selected_amenities.filter(is_enabled=True).values_list('amenity_id', flat=True)
    return amenities_payload(amenities_qs, business_type, selected_ids)


def amenities_payload_for_category(category):
    amenities_qs, business_type = get_amenities_for_category(category)
    return amenities_payload(amenities_qs, business_type, [])


def save_business_amenities(business, amenity_ids):
    amenity_ids = list(dict.fromkeys(amenity_ids or []))
    amenities_qs, _ = get_amenities_for_business(business)
    allowed_ids = set(amenities_qs.values_list('id', flat=True))
    invalid = set(amenity_ids) - allowed_ids
    if invalid:
        return 'برخی امکانات برای این کسب‌وکار مجاز نیستند.'

    with transaction.atomic():
        business.selected_amenities.all().delete()
        for amenity_id in amenity_ids:
            BusinessAmenity.objects.create(
                business_profile=business,
                amenity_id=amenity_id,
                is_enabled=True,
            )
    return None


def parse_working_hours(entries, require_full_week=False):
    from accounts.serializers import WorkingHoursEntrySerializer

    if not isinstance(entries, list) or len(entries) == 0:
        return None, 'ساعات کاری الزامی است.'

    validated_entries = []
    for entry in entries:
        entry_serializer = WorkingHoursEntrySerializer(data=entry)
        if not entry_serializer.is_valid():
            return None, 'ساعت شروع و پایان هر روز باز باید معتبر باشد و ساعت شروع قبل از پایان باشد.'
        validated_entries.append(entry_serializer.validated_data)

    weekdays = [entry['weekday'] for entry in validated_entries]
    if len(weekdays) != len(set(weekdays)):
        return None, 'هر روز هفته فقط یک بار قابل ثبت است.'
    if require_full_week and set(weekdays) != set(range(7)):
        return None, 'ساعات کاری هر هفت روز هفته باید ثبت شود.'
    return validated_entries, None


def apply_working_hours(business, validated_entries):
    with transaction.atomic():
        business.working_hours.filter(is_break=False).delete()
        for entry in validated_entries:
            if entry['is_closed']:
                BusinessWorkingHours.objects.create(
                    business_profile=business,
                    weekday=entry['weekday'],
                    start_time=time(0, 0),
                    end_time=time(0, 0),
                    is_closed=True,
                )
            else:
                BusinessWorkingHours.objects.create(
                    business_profile=business,
                    weekday=entry['weekday'],
                    start_time=entry['start_time'],
                    end_time=entry['end_time'],
                    is_closed=False,
                )


def working_hours_payload(business):
    from accounts.serializers import BusinessWorkingHoursSerializer

    hours = list(business.working_hours.filter(is_break=False).order_by('weekday', 'start_time'))
    by_weekday = {hour.weekday: hour for hour in hours}
    schedule = []
    for weekday, label in BusinessWorkingHours.WEEKDAY_CHOICES:
        entry = by_weekday.get(weekday)
        if entry:
            schedule.append(BusinessWorkingHoursSerializer(entry).data)
        else:
            schedule.append({
                'weekday': weekday,
                'weekday_display': label,
                'start_time': '09:00:00',
                'end_time': '22:00:00',
                'is_closed': False,
                'is_break': False,
            })
    return {
        'schedule': schedule,
        'is_configured': bool(hours),
    }


def save_business_working_hours(business, entries, require_full_week=False):
    validated_entries, error = parse_working_hours(entries, require_full_week=require_full_week)
    if error:
        return error
    try:
        apply_working_hours(business, validated_entries)
    except DjangoValidationError as exc:
        messages = getattr(exc, 'messages', None) or [str(exc)]
        return messages[0] if messages else 'ساعات کاری نامعتبر است.'
    return None
