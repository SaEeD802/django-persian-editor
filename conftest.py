import os
import django
from django.conf import settings

# تنظیمات جنگو برای تست‌ها
def pytest_configure():
    # بررسی اینکه آیا تنظیمات قبلاً پیکربندی شده‌اند یا خیر
    if not settings.configured:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'test_settings')
        
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
            TEMPLATES=[
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
            ],
            MEDIA_URL='/media/',
            MEDIA_ROOT=os.path.join(os.path.dirname(__file__), 'media'),
            STATIC_URL='/static/',
            STATIC_ROOT=os.path.join(os.path.dirname(__file__), 'static'),
        )
    
    django.setup()
