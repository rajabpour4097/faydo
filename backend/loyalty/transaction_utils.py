import csv
import io
import zipfile
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo
from xml.sax.saxutils import escape as xml_escape

from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.encoding import force_str

from .models import Transaction

TEHRAN = ZoneInfo('Asia/Tehran')

STATUS_LABELS = {
    'pending': 'در انتظار تایید',
    'approved': 'تایید شده',
    'rejected': 'رد شده',
}

TYPE_LABELS = {
    'regular': 'عادی',
    'elite_gift': 'هدیه ویژه',
}

PERIOD_LABELS = {
    'today': 'خلاصه امروز',
    'yesterday': 'خلاصه دیروز',
    'week': 'خلاصه این هفته',
    'month': 'خلاصه این ماه',
    'custom': 'خلاصه بازه انتخابی',
}


def gregorian_to_jalali(gy, gm, gd):
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    gy2 = gy + 1 if gm > 2 else gy
    days = 355666 + (365 * gy) + (gy2 + 3) // 4 - (gy2 + 99) // 100 + (gy2 + 399) // 400 + gd + g_d_m[gm - 1]
    jy = -1595 + 33 * (days // 12053)
    days %= 12053
    jy += 4 * (days // 1461)
    days %= 1461
    if days > 365:
        jy += (days - 1) // 365
        days = (days - 1) % 365
    if days < 186:
        jm = 1 + days // 31
        jd = 1 + (days % 31)
    else:
        jm = 7 + (days - 186) // 30
        jd = 1 + ((days - 186) % 30)
    return jy, jm, jd


def jalali_to_gregorian(jy, jm, jd):
    jy += 1595
    days = -355668 + (365 * jy) + (jy // 33) * 8 + ((jy % 33) + 3) // 4 + jd
    if jm < 7:
        days += 31 * (jm - 1)
    else:
        days += 186 + 30 * (jm - 7)
    gy = 400 * (days // 146097)
    days %= 146097
    if days > 36524:
        days -= 1
        gy += 100 * (days // 36524)
        days %= 36524
        if days >= 365:
            days += 1
    gy += 4 * (days // 1461)
    days %= 1461
    if days > 365:
        gy += (days - 1) // 365
        days = (days - 1) % 365
    gd = days + 1
    leap = (gy % 4 == 0 and gy % 100 != 0) or (gy % 400 == 0)
    g_d_m = [0, 31, 29 if leap else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    gm = 12
    for month in range(1, 13):
        dim = g_d_m[month]
        if gd <= dim:
            gm = month
            break
        gd -= dim
    return gy, gm, gd


def jalali_code(dt):
    if not dt:
        return ''
    local = timezone.localtime(dt, TEHRAN)
    jy, jm, jd = gregorian_to_jalali(local.year, local.month, local.day)
    return f'{jy:04d}{jm:02d}{jd:02d}'


def jalali_datetime_label(dt):
    if not dt:
        return ''
    local = timezone.localtime(dt, TEHRAN)
    jy, jm, jd = gregorian_to_jalali(local.year, local.month, local.day)
    months = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
    ]
    return f'{jd} {months[jm - 1]} {jy} - {local.strftime("%H:%M")}'


def reference_code(transaction):
    return f'FD-{jalali_code(transaction.created_at)}-{transaction.id:05d}'


def annotate_visit_count(qs):
    visits = (
        Transaction.objects.filter(
            business_id=OuterRef('business_id'),
            customer_id=OuterRef('customer_id'),
            status='approved',
        )
        .order_by()
        .values('customer_id')
        .annotate(c=Count('id'))
        .values('c')
    )
    return qs.annotate(
        visit_count=Coalesce(Subquery(visits[:1], output_field=IntegerField()), Value(0))
    )


def _parse_date(raw):
    if not raw:
        return None
    try:
        return datetime.strptime(str(raw)[:10], '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return None


def period_bounds(params):
    period = (params.get('period') or '').strip()
    date_from = _parse_date(params.get('date_from'))
    date_to = _parse_date(params.get('date_to'))
    if not period and not date_from and not date_to:
        return None, None, None

    now = timezone.now().astimezone(TEHRAN)
    today = now.date()
    if period == 'yesterday':
        day = today - timedelta(days=1)
        start_d, end_d = day, day
    elif period == 'week':
        days_since_sat = (today.weekday() + 2) % 7
        start_d, end_d = today - timedelta(days=days_since_sat), today
    elif period == 'month':
        jy, jm, _jd = gregorian_to_jalali(today.year, today.month, today.day)
        gy, gm, gd = jalali_to_gregorian(jy, jm, 1)
        start_d, end_d = date(gy, gm, gd), today
    elif period == 'custom' or date_from or date_to:
        period = 'custom'
        start_d = date_from or today
        end_d = date_to or today
        if start_d > end_d:
            start_d, end_d = end_d, start_d
    else:
        period = 'today'
        start_d, end_d = today, today

    start = datetime.combine(start_d, datetime.min.time(), tzinfo=TEHRAN)
    end = datetime.combine(end_d, datetime.max.time().replace(microsecond=0), tzinfo=TEHRAN)
    return start, end, period or 'today'


def apply_transaction_filters(qs, params):
    start, end, _period = period_bounds(params)
    if start:
        qs = qs.filter(created_at__gte=start)
    if end:
        qs = qs.filter(created_at__lte=end)

    status = (params.get('status') or '').strip()
    if status and status != 'all':
        qs = qs.filter(status=status)

    tx_type = (params.get('transaction_type') or params.get('type') or '').strip()
    if tx_type and tx_type != 'all':
        qs = qs.filter(transaction_type=tx_type)

    search = (params.get('search') or '').strip()
    if search:
        query = (
            Q(customer__user__first_name__icontains=search)
            | Q(customer__user__last_name__icontains=search)
            | Q(customer__user__username__icontains=search)
            | Q(note__icontains=search)
            | Q(description__icontains=search)
        )
        digits = ''.join(ch for ch in search if ch.isdigit())
        if digits:
            if digits.isdigit() and len(digits) <= 9:
                query |= Q(id=int(digits))
            if len(digits) >= 3:
                suffix = int(digits[-5:])
                query |= Q(id=suffix)
            query |= Q(customer__user__phone_number__icontains=digits)
        qs = qs.filter(query)

    return qs


def optimized_transactions(qs):
    return annotate_visit_count(
        qs.select_related(
            'customer__user',
            'business',
            'business__category',
            'package',
            'package__discount_all',
            'package__specific_discount',
            'elite_gift',
        )
    )


def build_csv(rows):
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        'شماره تراکنش', 'تاریخ', 'نام مشتری', 'شماره مشتری', 'نوع',
        'وضعیت', 'مبلغ فاکتور', 'تخفیف', 'کش‌بک', 'مبلغ نهایی', 'امتیاز',
    ])
    for row in rows:
        writer.writerow([
            row['reference'],
            row['created_label'],
            row['customer_name'],
            row['customer_phone'],
            row['type_label'],
            row['status_label'],
            row['original_amount'],
            row['discount_amount'],
            row['cashback_amount'],
            row['final_amount'],
            row['points_earned'],
        ])
    return ('\ufeff' + buffer.getvalue()).encode('utf-8')


def _col_letter(index):
    result = ''
    index += 1
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result


def build_xlsx(rows):
    headers = [
        'شماره تراکنش', 'تاریخ', 'نام مشتری', 'شماره مشتری', 'نوع',
        'وضعیت', 'مبلغ فاکتور', 'تخفیف', 'کش‌بک', 'مبلغ نهایی', 'امتیاز',
    ]
    keys = [
        'reference', 'created_label', 'customer_name', 'customer_phone', 'type_label',
        'status_label', 'original_amount', 'discount_amount', 'cashback_amount',
        'final_amount', 'points_earned',
    ]
    strings = list(headers)
    for row in rows:
        for key in keys:
            strings.append(force_str(row.get(key, '')))

    unique = []
    index_of = {}
    for value in strings:
        if value not in index_of:
            index_of[value] = len(unique)
            unique.append(value)

    def si_xml(text):
        return f'<si><t xml:space="preserve">{xml_escape(text)}</t></si>'

    sst = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(strings)}" uniqueCount="{len(unique)}">'
        + ''.join(si_xml(item) for item in unique)
        + '</sst>'
    )

    def cell(row_number, col_index, value):
        ref = f'{_col_letter(col_index)}{row_number}'
        return f'<c r="{ref}" t="s"><v>{index_of[force_str(value)]}</v></c>'

    sheet_rows = ['<row r="1">' + ''.join(cell(1, i, headers[i]) for i in range(len(headers))) + '</row>']
    for offset, row in enumerate(rows, start=2):
        sheet_rows.append(
            f'<row r="{offset}">'
            + ''.join(cell(offset, i, row.get(keys[i], '')) for i in range(len(keys)))
            + '</row>'
        )

    sheet = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetData>' + ''.join(sheet_rows) + '</sheetData></worksheet>'
    )

    files = {
        '[Content_Types].xml': (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-officedocument.package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            '</Types>'
        ),
        '_rels/.rels': (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            '</Relationships>'
        ),
        'xl/workbook.xml': (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="transactions" sheetId="1" r:id="rId1"/></sheets></workbook>'
        ),
        'xl/_rels/workbook.xml.rels': (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            '</Relationships>'
        ),
        'xl/styles.xml': (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
            '<fills count="2"><fill><patternFill patternType="none"/></fill>'
            '<fill><patternFill patternType="gray125"/></fill></fills>'
            '<borders count="1"><border/></borders>'
            '<cellStyleXfs count="1"><xf/></cellStyleXfs>'
            '<cellXfs count="1"><xf/></cellXfs>'
            '</styleSheet>'
        ),
        'xl/sharedStrings.xml': sst,
        'xl/worksheets/sheet1.xml': sheet,
    }

    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, content in files.items():
            archive.writestr(name, content.encode('utf-8'))
    return output.getvalue()


def build_pdf_html(rows, title='گزارش تراکنش‌ها'):
    def td(value):
        return f'<td>{xml_escape(force_str(value))}</td>'

    body_rows = []
    for row in rows:
        body_rows.append(
            '<tr>'
            + td(row['reference'])
            + td(row['created_label'])
            + td(row['customer_name'])
            + td(row['type_label'])
            + td(row['status_label'])
            + td(row['original_amount'])
            + td(row['discount_amount'])
            + td(row['cashback_amount'])
            + td(row['final_amount'])
            + '</tr>'
        )
    table = ''.join(body_rows) or '<tr><td colspan="9">تراکنشی برای این فیلترها یافت نشد</td></tr>'
    return f'''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>{xml_escape(title)}</title>
  <style>
    body {{ font-family: Tahoma, sans-serif; direction: rtl; padding: 24px; color: #111827; }}
    h1 {{ font-size: 18px; margin-bottom: 4px; }}
    p {{ color: #6b7280; font-size: 12px; margin-bottom: 16px; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 11px; }}
    th, td {{ border: 1px solid #e5e7eb; padding: 8px; text-align: right; }}
    th {{ background: #7C5CFC; color: #fff; }}
    @media print {{ button {{ display: none; }} }}
  </style>
</head>
<body>
  <button onclick="window.print()">ذخیره PDF</button>
  <h1>{xml_escape(title)}</h1>
  <p>تعداد ردیف‌ها: {len(rows)}</p>
  <table>
    <thead>
      <tr>
        <th>شماره</th><th>تاریخ</th><th>مشتری</th><th>نوع</th><th>وضعیت</th>
        <th>مبلغ فاکتور</th><th>تخفیف</th><th>کش‌بک</th><th>مبلغ نهایی</th>
      </tr>
    </thead>
    <tbody>{table}</tbody>
  </table>
  <script>window.addEventListener('load', function () {{ setTimeout(function () {{ window.print(); }}, 300); }});</script>
</body>
</html>'''
