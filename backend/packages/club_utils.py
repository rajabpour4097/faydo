"""Shared helpers for resolving Faydo clubs from business categories."""

from accounts.models import Club


CATEGORY_CLUB_KEYWORDS = {
    'باشگاه طعم\u200cها': [
        'کافه', 'رستوران', 'بیکری', 'شیرینی', 'فست', 'غذا', 'نوشیدنی', 'کافی',
        'food', 'cafe', 'restaurant', 'bakery',
    ],
    'باشگاه تندرستی': [
        'کلینیک', 'زیبایی', 'ورزش', 'سلامت', 'ماساژ', 'پزشک', 'تندرست', 'باشگاه',
        'fitness', 'gym', 'spa', 'clinic', 'health',
    ],
    'باشگاه سبک زندگی': [
        'آرایش', 'مزون', 'پت', 'بازی', 'پوشاک', 'مد', 'سبک', 'سالن', 'فروشگاه',
        'pet', 'salon', 'fashion', 'boutique',
    ],
}


def normalize_persian(text: str) -> str:
    if not text:
        return ''
    return (
        text.replace('\u200c', '')
        .replace('\u200d', '')
        .replace('ي', 'ی')
        .replace('ك', 'ک')
        .replace(' ', '')
        .strip()
        .lower()
    )


def find_club_by_name(name: str):
    """Find club by exact or normalized Persian name."""
    if not name:
        return None
    club = Club.objects.filter(name=name).first()
    if club:
        return club
    target = normalize_persian(name)
    for candidate in Club.objects.all():
        if normalize_persian(candidate.name) == target:
            return candidate
    return None


def category_name_chain(category) -> str:
    names = []
    cat = category
    visited = set()
    while cat and cat.pk not in visited:
        visited.add(cat.pk)
        if cat.name:
            names.append(cat.name)
        cat = cat.parent
    return ' '.join(names)


def infer_club_from_category_name(category):
    combined = category_name_chain(category)
    combined_lower = combined.lower()
    for club_name, keywords in CATEGORY_CLUB_KEYWORDS.items():
        if any(kw in combined or kw in combined_lower for kw in keywords):
            return find_club_by_name(club_name)
    return None


def resolve_business_club(business_profile):
    """Resolve club from category FK, parent chain, or category name keywords."""
    if not business_profile or not business_profile.category_id:
        return None

    category = business_profile.category
    cat = category
    visited = set()
    while cat and cat.pk not in visited:
        visited.add(cat.pk)
        if cat.club_id:
            return cat.club
        cat = cat.parent

    return infer_club_from_category_name(category)


def assign_club_to_service_category(service_category):
    """Assign club FK to a service category when missing."""
    if not service_category or service_category.club_id:
        return service_category.club
    club = infer_club_from_category_name(service_category)
    if club:
        service_category.club = club
        service_category.save(update_fields=['club'])
    return club
