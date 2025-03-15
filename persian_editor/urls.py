"""
الگوهای URL ویرایشگر فارسی

این ماژول شامل الگوهای URL مربوط به ویرایشگر فارسی است.
"""

from django.urls import path
from . import views

app_name = 'persian_editor'

urlpatterns = [
    path('upload-image/', views.upload_image, name='upload_image'),
    path('save-content/', views.save_content, name='save_content'),
]
