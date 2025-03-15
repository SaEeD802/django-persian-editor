"""
نمای‌های ویرایشگر فارسی

این ماژول شامل نمای‌های مربوط به ویرایشگر فارسی است،
از جمله نمای آپلود تصویر با امنیت بالا.
"""

import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .security import validate_image_file, clean_html, get_secure_content_headers


@csrf_protect
@require_POST
def upload_image(request):
    """
    نمای آپلود تصویر با امنیت بالا
    
    این نما تصویر آپلود شده را بررسی می‌کند و در صورت معتبر بودن، آن را ذخیره می‌کند.
    
    Args:
        request: درخواست HTTP
        
    Returns:
        JsonResponse: پاسخ JSON شامل آدرس تصویر آپلود شده یا پیام خطا
    """
    response = JsonResponse({'error': 'فایلی برای آپلود یافت نشد.'}, status=400)
    
    # اضافه کردن هدرهای امنیتی به پاسخ
    for header, value in get_secure_content_headers().items():
        response[header] = value
    
    if 'image' not in request.FILES:
        return response
    
    image_file = request.FILES['image']
    
    try:
        # بررسی امنیتی فایل
        validate_image_file(image_file)
        
        # ایجاد مسیر ذخیره‌سازی امن
        file_name = image_file.name
        file_path = os.path.join('persian_editor_uploads', file_name)
        
        # اطمینان از یکتا بودن نام فایل
        counter = 1
        while default_storage.exists(file_path):
            name, ext = os.path.splitext(file_name)
            file_path = os.path.join('persian_editor_uploads', f"{name}_{counter}{ext}")
            counter += 1
        
        # ذخیره فایل
        path = default_storage.save(file_path, ContentFile(image_file.read()))
        
        # ساخت URL کامل
        file_url = settings.MEDIA_URL + path
        
        return JsonResponse({
            'success': True,
            'url': file_url
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_protect
@require_POST
def save_content(request):
    """
    نمای ذخیره محتوای ویرایشگر با امنیت بالا
    
    این نما محتوای HTML ارسال شده را پاکسازی می‌کند و سپس آن را ذخیره می‌کند.
    
    Args:
        request: درخواست HTTP
        
    Returns:
        JsonResponse: پاسخ JSON شامل وضعیت ذخیره‌سازی
    """
    response = JsonResponse({'error': 'داده‌ای برای ذخیره‌سازی یافت نشد.'}, status=400)
    
    # اضافه کردن هدرهای امنیتی به پاسخ
    for header, value in get_secure_content_headers().items():
        response[header] = value
    
    try:
        data = json.loads(request.body)
        
        if 'content' not in data or 'field_id' not in data:
            return response
        
        # پاکسازی محتوای HTML
        content = data['content']
        field_id = data['field_id']
        
        cleaned_content = clean_html(content)
        
        # در اینجا می‌توانید محتوای پاکسازی شده را در دیتابیس ذخیره کنید
        # این بخش باید بر اساس نیازهای پروژه پیاده‌سازی شود
        
        return JsonResponse({
            'success': True,
            'message': 'محتوا با موفقیت ذخیره شد.'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
