"""Helpers for resolving business type and amenity catalogs."""

from accounts.models import Amenity

BUSINESS_TYPE_KEYWORDS = {
    'cafe': ['کافه', 'قهوه', 'cafe', 'coffee'],
    'restaurant': ['رستوران', 'restaurant', 'غذا'],
    'bakery': ['شیرینی', 'بیکری', 'نان', 'bakery', 'شیرینی\u200cفروشی'],
    'medical': ['کلینیک', 'درمان', 'پزشکی', 'medical', 'سلامت', 'دندان'],
    'beauty': ['زیبایی', 'آرایشی', 'beauty', 'اسپا'],
    'gym': ['باشگاه', 'ورزش', 'gym', 'فیتنس', 'کراس'],
    'salon': ['آرایشگاه', 'مو', 'salon', 'آرایش'],
    'boutique': ['مزون', 'بوتیک', 'لباس', 'boutique', 'پوشاک'],
    'pets': ['پت', 'حیوان', 'pet', 'دامپزشک'],
    'playground': ['بازی', 'کودک', 'playground', 'خانه بازی'],
}


def normalize_persian(text: str) -> str:
    if not text:
        return ''
    return (
        text.replace('\u200c', '')
        .replace('\u200d', '')
        .replace('ي', 'ی')
        .replace('ك', 'ک')
        .strip()
        .lower()
    )


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


def infer_business_type_from_category(category) -> str | None:
    """Map a ServiceCategory to one of the amenity business_type keys."""
    if not category:
        return None
    combined = normalize_persian(category_name_chain(category))
    for business_type, keywords in BUSINESS_TYPE_KEYWORDS.items():
        for kw in keywords:
            if normalize_persian(kw) in combined:
                return business_type
    return None


def get_amenities_for_business(business_profile):
    """Return general + category-specific amenities for a business."""
    business_type = infer_business_type_from_category(
        business_profile.category if business_profile else None
    )
    qs = Amenity.objects.filter(is_active=True)
    if business_type:
        qs = qs.filter(business_type__in=['general', business_type])
    else:
        qs = qs.filter(business_type='general')
    return qs.order_by('business_type', 'order', 'name'), business_type


BUSINESS_TYPE_LABELS = dict(Amenity.BUSINESS_TYPE_CHOICES)


def get_business_type_label(business_type: str | None) -> str | None:
    if not business_type or business_type == 'general':
        return None
    return BUSINESS_TYPE_LABELS.get(business_type)
