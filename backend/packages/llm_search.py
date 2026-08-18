# -*- coding: utf-8 -*-
"""رتبه‌بندی جستجوی باشگاه با Groq (Llama رایگان)."""
import json
import logging
import re

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
ALLOWED_INTENTS = {
    'birthday', 'welcome', 'gift', 'friend', 'early', 'taste', 'wellness', 'lifestyle',
}

SYSTEM_PROMPT = """You rank Faydo club businesses for a Persian customer query.
Allowed experience names: خوشامدگویی, هدیه کوچک, توجه ویژه, پیشنهاد اختصاصی, امتیاز بازگشت, دسترسی زودتر, تجربه ویژه, روز خاص من, دعوت از دوست, هدیه برند
Return ONLY JSON:
{
  "intents": ["birthday"|"welcome"|"gift"|"friend"|"early"|"taste"|"wellness"|"lifestyle"],
  "prefer_tab": "gold"|"vip",
  "keywords": ["persian keywords"],
  "ranked_ids": [ids from catalog, most relevant first]
}
Rules:
- Use only ids that appear in the catalog.
- Short keyword queries: rank name/category matches first.
- Birthday/occasion queries: prefer businesses whose gold/vip text mentions تولد, کیک, جشن, روز خاص.
- Friend/together queries: prefer دعوت از دوست.
- If nothing is relevant, ranked_ids is [].
- Do not invent businesses.
"""


def groq_configured():
    return bool(getattr(settings, 'GROQ_API_KEY', '') or '')


def _parse_json(text):
    if not text:
        return None
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.S)
        if not match:
            return None
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None


def rank_catalog(query, catalog):
    """
    catalog: list of {id, name, club, category, city, gold, vip}
    """
    if not groq_configured():
        return {'ok': False, 'reason': 'missing_key'}

    allowed_ids = {item.get('id') for item in catalog if item.get('id') is not None}
    payload = {
        'model': getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile'),
        'temperature': 0.15,
        'max_tokens': 700,
        'response_format': {'type': 'json_object'},
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {
                'role': 'user',
                'content': json.dumps(
                    {'query': query, 'catalog': catalog},
                    ensure_ascii=False,
                ),
            },
        ],
    }
    try:
        response = requests.post(
            GROQ_URL,
            headers={
                'Authorization': f"Bearer {settings.GROQ_API_KEY}",
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=12,
        )
        if response.status_code >= 400:
            logger.warning('Groq search failed: %s %s', response.status_code, response.text[:300])
            return {'ok': False, 'reason': 'provider_error'}
        body = response.json()
        content = (body.get('choices') or [{}])[0].get('message', {}).get('content', '')
        data = _parse_json(content) or {}
    except Exception:
        logger.exception('Groq search request failed')
        return {'ok': False, 'reason': 'provider_error'}

    ranked = []
    for value in data.get('ranked_ids') or []:
        try:
            item_id = int(value)
        except (TypeError, ValueError):
            continue
        if item_id in allowed_ids and item_id not in ranked:
            ranked.append(item_id)

    intents = [item for item in (data.get('intents') or []) if item in ALLOWED_INTENTS]
    prefer = data.get('prefer_tab') if data.get('prefer_tab') in ('gold', 'vip') else 'gold'
    keywords = [str(word).strip() for word in (data.get('keywords') or []) if str(word).strip()][:12]

    return {
        'ok': True,
        'provider': 'groq',
        'model': payload['model'],
        'intents': intents,
        'prefer_tab': prefer,
        'keywords': keywords,
        'ranked_ids': ranked,
    }
