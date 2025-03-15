"""
اسکریپت ساده برای تست ویرایشگر فارسی
"""

import os
import sys
import django
from django.conf import settings

# تنظیم محیط جنگو
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'test_settings')

# پیکربندی تنظیمات
settings.configure(
    DEBUG=True,
    USE_TZ=True,
    DATABASES={
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    },
    INSTALLED_APPS=[
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sites",
        "persian_editor",
    ],
    SITE_ID=1,
    MIDDLEWARE=[
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'persian_editor.middleware.SecurityHeadersMiddleware',
    ],
    SECRET_KEY="django-insecure-test-key-do-not-use-in-production",
)

django.setup()

# وارد کردن ماژول‌های ویرایشگر فارسی
from persian_editor.security import clean_html, validate_image_file
from persian_editor.widgets import PersianEditorWidget

# تست تابع clean_html
def test_clean_html():
    print("تست پاکسازی HTML:")
    
    # HTML با اسکریپت مخرب
    malicious_html = '<p>متن عادی</p><script>alert("XSS")</script>'
    cleaned = clean_html(malicious_html)
    
    print(f"HTML اصلی: {malicious_html}")
    print(f"HTML پاکسازی شده: {cleaned}")
    
    # بررسی نتیجه
    assert '<script>' not in cleaned
    assert 'alert("XSS")' not in cleaned
    assert '<p>متن عادی</p>' in cleaned
    
    print("تست پاکسازی HTML با موفقیت انجام شد.\n")

# تست ویجت PersianEditorWidget
def test_persian_editor_widget():
    print("تست ویجت PersianEditorWidget:")
    
    # ایجاد یک نمونه از ویجت
    widget = PersianEditorWidget()
    
    # بررسی ویژگی‌های ویجت
    print(f"نام کلاس ویجت: {widget.__class__.__name__}")
    
    # بررسی وجود فایل‌های رسانه
    print(f"آیا فایل‌های CSS تعریف شده‌اند: {'all' in widget.Media.css}")
    print(f"آیا فایل‌های JS تعریف شده‌اند: {len(widget.Media.js) > 0}")
    
    # بررسی نتیجه
    assert widget.__class__.__name__ == 'PersianEditorWidget'
    assert 'all' in widget.Media.css
    assert len(widget.Media.js) > 0
    
    print("تست ویجت PersianEditorWidget با موفقیت انجام شد.\n")

if __name__ == "__main__":
    print("شروع تست‌های ویرایشگر فارسی...\n")
    
    # اجرای تست‌ها
    test_clean_html()
    test_persian_editor_widget()
    
    print("تمام تست‌ها با موفقیت انجام شدند!")
