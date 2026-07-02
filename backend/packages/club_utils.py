"""Shared helpers for resolving Faydo clubs from business categories."""

from accounts.models import Club


DEFAULT_CLUBS = [
    {
        "name": "باشگاه طعم\u200cها",
        "description": "کافه\u200cها، رستوران\u200cها، بیکری\u200cها و شیرینی\u200cفروشی\u200cها",
        "icon": "🍽",
    },
    {
        "name": "باشگاه تندرستی",
        "description": "کلینیک\u200cها، مراکز زیبایی، باشگاه\u200cهای ورزشی",
        "icon": "💪",
    },
    {
        "name": "باشگاه سبک زندگی",
        "description": "آرایشگاه، مزون، پت\u200cشاپ، خانه بازی",
        "icon": "✨",
    },
]

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


def get_club_match_key(name: str) -> str:
    """Map any club label to one of taste / wellness / lifestyle."""
    n = normalize_persian(name)
    if 'طعم' in n:
        return 'taste'
    if 'تندرست' in n or ('سلامت' in n and 'سبک' not in n):
        return 'wellness'
    if 'سبک' in n and 'زندگی' in n:
        return 'lifestyle'
    return n


def resolve_canonical_club(club):
    """Map duplicate club rows (e.g. 'طعم‌ها') to the PDF canonical club."""
    if not club:
        return None
    key = get_club_match_key(club.name)
    for data in DEFAULT_CLUBS:
        if get_club_match_key(data['name']) == key:
            canonical = find_club_by_name(data['name'])
            if canonical:
                return canonical
    return club


def club_ids_for_lookup(club):
    """All club PKs that should share the same VIP hint set."""
    if not club:
        return []
    key = get_club_match_key(club.name)
    ids = {club.pk}
    canonical = resolve_canonical_club(club)
    if canonical:
        ids.add(canonical.pk)
    for candidate in Club.objects.all():
        if get_club_match_key(candidate.name) == key:
            ids.add(candidate.pk)
    return list(ids)


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


def ensure_default_clubs():
    """Create the 3 PDF clubs if they do not exist yet."""
    ensured = []
    created_count = 0
    for data in DEFAULT_CLUBS:
        club = find_club_by_name(data["name"])
        if not club:
            key = get_club_match_key(data["name"])
            for candidate in Club.objects.all():
                if get_club_match_key(candidate.name) == key:
                    club = candidate
                    break
        if club:
            changed = False
            if club.name != data["name"] and not Club.objects.filter(name=data["name"]).exclude(pk=club.pk).exists():
                club.name = data["name"]
                changed = True
            for field in ("description", "icon"):
                if data.get(field) and getattr(club, field) != data[field]:
                    setattr(club, field, data[field])
                    changed = True
            if changed:
                club.save()
        else:
            club = Club.objects.create(
                name=data["name"],
                description=data.get("description", ""),
                icon=data.get("icon", ""),
            )
            created_count += 1
        ensured.append(club)
    return ensured, created_count


def consolidate_duplicate_clubs():
    """
    Merge legacy duplicate clubs ('طعم‌ها', 'تندرستی', …)
    onto the 3 canonical PDF clubs and move related data.
    """
    from accounts.models import ServiceCategory
    from packages.models import VipExperienceCategory

    reassigned_cats = 0
    merged_vip = 0
    deleted_clubs = 0

    canonical_by_key = {}
    for data in DEFAULT_CLUBS:
        club = find_club_by_name(data['name'])
        if club:
            canonical_by_key[get_club_match_key(data['name'])] = club

    for club in list(Club.objects.all()):
        key = get_club_match_key(club.name)
        canonical = canonical_by_key.get(key)
        if not canonical or canonical.pk == club.pk:
            continue

        reassigned_cats += ServiceCategory.objects.filter(club=club).update(club=canonical)

        for vip_item in VipExperienceCategory.objects.filter(club=club, category__isnull=True):
            VipExperienceCategory.objects.update_or_create(
                vip_type=vip_item.vip_type,
                name=vip_item.name,
                club=canonical,
                category=None,
                defaults={'description': vip_item.description},
            )
            vip_item.delete()
            merged_vip += 1

        club.delete()
        deleted_clubs += 1

    return reassigned_cats, merged_vip, deleted_clubs


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
            return resolve_canonical_club(cat.club)
        cat = cat.parent

    club = infer_club_from_category_name(category)
    return resolve_canonical_club(club) if club else None


def assign_club_to_service_category(service_category):
    """Assign club FK to a service category when missing."""
    if not service_category:
        return None
    if service_category.club_id:
        canonical = resolve_canonical_club(service_category.club)
        if canonical and canonical.pk != service_category.club_id:
            service_category.club = canonical
            service_category.save(update_fields=['club'])
        return service_category.club
    club = infer_club_from_category_name(service_category)
    if club:
        club = resolve_canonical_club(club)
        service_category.club = club
        service_category.save(update_fields=['club'])
    return club
