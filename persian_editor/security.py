"""
ماژول امنیتی برای ویرایشگر فارسی

این ماژول شامل توابع و کلاس‌های مربوط به امنیت ویرایشگر فارسی است،
از جمله پاکسازی HTML، بررسی فایل‌های آپلود شده و سایر موارد امنیتی.
"""

import os
import re
import magic
import bleach
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# تگ‌های HTML مجاز برای استفاده در ویرایشگر
ALLOWED_TAGS = [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'
]

# ویژگی‌های مجاز برای تگ‌های HTML
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'abbr': ['title'],
    'acronym': ['title'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'style'],
    'div': ['class', 'dir', 'style'],
    'p': ['class', 'dir', 'style'],
    'span': ['class', 'dir', 'style'],
    'table': ['border', 'cellpadding', 'cellspacing', 'style', 'width'],
    'td': ['colspan', 'rowspan', 'style', 'width'],
    'th': ['colspan', 'rowspan', 'style', 'width'],
    'tr': ['style'],
    '*': ['class', 'style']
}

# استایل‌های CSS مجاز
ALLOWED_STYLES = [
    'color', 'background-color', 'font-size', 'font-family', 'text-align', 'text-decoration',
    'border', 'border-collapse', 'padding', 'margin', 'width', 'height', 'min-width', 'min-height'
]

# پروتکل‌های مجاز برای لینک‌ها
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto', 'tel']

# حداکثر اندازه فایل آپلود (5 مگابایت)
MAX_UPLOAD_SIZE = 5 * 1024 * 1024

# انواع فایل مجاز برای آپلود
ALLOWED_MIME_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg']
}


def clean_html(html_content):
    """
    پاکسازی محتوای HTML برای جلوگیری از حملات XSS
    
    این تابع محتوای HTML را پاکسازی می‌کند و فقط تگ‌ها، ویژگی‌ها و استایل‌های مجاز را اجازه می‌دهد.
    
    Args:
        html_content (str): محتوای HTML که باید پاکسازی شود
        
    Returns:
        str: محتوای HTML پاکسازی شده
    """
    # استفاده از css_sanitizer برای پاکسازی استایل‌ها
    from bleach.css_sanitizer import CSSSanitizer
    import re
    
    # حذف اسکریپت‌ها و محتوای آن‌ها قبل از پاکسازی
    html_content = re.sub(r'<script\b[^>]*>(.*?)</script>', '', html_content, flags=re.DOTALL)
    
    css_sanitizer = CSSSanitizer(allowed_css_properties=ALLOWED_STYLES)
    
    cleaned_html = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
        css_sanitizer=css_sanitizer
    )
    
    # حذف اسکریپت‌های درون رویدادها
    cleaned_html = re.sub(r'on\w+=".*?"', '', cleaned_html)
    cleaned_html = re.sub(r'on\w+=\'.*?\'', '', cleaned_html)
    
    return cleaned_html


def validate_image_file(uploaded_file):
    """
    بررسی امنیتی فایل تصویر آپلود شده
    
    این تابع فایل آپلود شده را از نظر اندازه، نوع و محتوا بررسی می‌کند.
    
    Args:
        uploaded_file: فایل آپلود شده
        
    Raises:
        ValidationError: اگر فایل معتبر نباشد
        
    Returns:
        bool: True اگر فایل معتبر باشد
    """
    # بررسی اندازه فایل
    if uploaded_file.size > MAX_UPLOAD_SIZE:
        raise ValidationError(
            _('اندازه فایل بیش از حد مجاز است. حداکثر اندازه مجاز %(max_size)s مگابایت است.'),
            params={'max_size': MAX_UPLOAD_SIZE / (1024 * 1024)}
        )
    
    # بررسی نوع فایل با استفاده از python-magic
    try:
        file_content = uploaded_file.read()
        uploaded_file.seek(0)  # بازگشت به ابتدای فایل
        
        mime = magic.Magic(mime=True)
        file_mime_type = mime.from_buffer(file_content)
        
        # بررسی اینکه نوع فایل در لیست انواع مجاز باشد
        if file_mime_type not in ALLOWED_MIME_TYPES:
            raise ValidationError(_('نوع فایل مجاز نیست. فقط فایل‌های تصویری مجاز هستند.'))
        
        # بررسی تطابق پسوند فایل با نوع MIME
        file_extension = os.path.splitext(uploaded_file.name)[1].lower()
        if file_extension not in ALLOWED_MIME_TYPES.get(file_mime_type, []):
            raise ValidationError(_('پسوند فایل با نوع محتوای آن مطابقت ندارد.'))
        
    except Exception as e:
        raise ValidationError(_('خطا در بررسی فایل: %(error)s'), params={'error': str(e)})
    
    return True


def get_secure_content_headers():
    """
    دریافت هدرهای امنیتی برای محتوا
    
    این تابع هدرهای امنیتی مانند Content-Security-Policy را برمی‌گرداند.
    
    Returns:
        dict: دیکشنری هدرهای امنیتی
    """
    headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; "
                                   "script-src 'self' 'unsafe-inline'; "
                                   "style-src 'self' 'unsafe-inline'; "
                                   "img-src 'self' data:; "
                                   "font-src 'self'; "
                                   "connect-src 'self'; "
                                   "media-src 'self'; "
                                   "object-src 'none'; "
                                   "frame-src 'self'; "
                                   "worker-src 'self'; "
                                   "form-action 'self'; "
                                   "base-uri 'self'; "
                                   "frame-ancestors 'self';"
    }
    
    return headers
