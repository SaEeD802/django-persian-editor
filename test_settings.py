"""
تنظیمات جنگو برای اجرای تست‌ها
"""

import os

# تنظیمات پایه
DEBUG = True
USE_TZ = True

# تنظیمات پایگاه داده
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# برنامه‌های نصب شده
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sites",
    "persian_editor",
]

SITE_ID = 1

# میان‌افزارها
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'persian_editor.middleware.SecurityHeadersMiddleware',
]

# تنظیمات قالب‌ها
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# تنظیمات URL
ROOT_URLCONF = 'persian_editor.urls'

# تنظیمات فایل‌های رسانه و استاتیک
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), 'media')
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(os.path.dirname(__file__), 'static')

# کلید مخفی - فقط برای تست
SECRET_KEY = 'django-insecure-test-key-do-not-use-in-production'

# تنظیمات امنیتی
