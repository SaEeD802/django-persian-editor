"""
تست‌های امنیتی ویرایشگر فارسی

این ماژول شامل تست‌های امنیتی برای ویرایشگر فارسی است.
"""

import os
import tempfile
from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile

from ..security import clean_html, validate_image_file


class SecurityTestCase(TestCase):
    """
    تست‌های امنیتی ویرایشگر فارسی
    """
    
    def setUp(self):
        """
        راه‌اندازی تست‌ها
        """
        self.client = Client()
    
    def test_html_cleaning(self):
        """
        تست پاکسازی HTML برای جلوگیری از XSS
        """
        # HTML با اسکریپت مخرب
        malicious_html = '<p>متن عادی</p><script>alert("XSS")</script>'
        cleaned = clean_html(malicious_html)
        
        # اسکریپت باید حذف شده باشد
        self.assertNotIn('<script>', cleaned)
        self.assertNotIn('alert("XSS")', cleaned)
        self.assertIn('<p>متن عادی</p>', cleaned)
        
        # HTML با رویداد onclick مخرب
        malicious_html = '<a href="#" onclick="alert(\'XSS\')">لینک</a>'
        cleaned = clean_html(malicious_html)
        
        # رویداد onclick باید حذف شده باشد
        self.assertNotIn('onclick', cleaned)
        self.assertIn('<a href="#"', cleaned)
        self.assertIn('لینک</a>', cleaned)
        
        # HTML با تگ iframe مخرب
        malicious_html = '<iframe src="javascript:alert(\'XSS\')"></iframe>'
        cleaned = clean_html(malicious_html)
        
        # تگ iframe باید حذف شده باشد
        self.assertNotIn('<iframe', cleaned)
        self.assertNotIn('</iframe>', cleaned)
    
    def test_image_validation(self):
        """
        تست بررسی امنیتی فایل تصویر
        """
        # ایجاد یک فایل تصویر معتبر
        with tempfile.NamedTemporaryFile(suffix='.jpg') as img_file:
            # ایجاد یک فایل JPEG ساده
            img_file.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xdb\x00C\x01\t\t\t\x0c\x0b\x0c\x18\r\r\x182!\x1c!22222222222222222222222222222222222222222222222222\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x03\x01"\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xc4\x00\x1f\x01\x00\x03\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x11\x00\x02\x01\x02\x04\x04\x03\x04\x07\x05\x04\x04\x00\x01\x02w\x00\x01\x02\x03\x11\x04\x05!1\x06\x12AQ\x07aq\x13"2\x81\x08\x14B\x91\xa1\xb1\xc1\t#3R\xf0\x15br\xd1\n\x16$4\xe1%\xf1\x17\x18\x19\x1a&\'()*56789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xfe\xfe(\xa2\x8a\x00\xff\xd9')
            img_file.seek(0)
            
            # ایجاد یک فایل آپلود شده
            uploaded_file = SimpleUploadedFile(
                name='test.jpg',
                content=img_file.read(),
                content_type='image/jpeg'
            )
            
            # بررسی فایل
            try:
                result = validate_image_file(uploaded_file)
                self.assertTrue(result)
            except Exception as e:
                self.fail(f"بررسی فایل تصویر معتبر با خطا مواجه شد: {e}")
    
    def test_content_security_headers(self):
        """
        تست هدرهای امنیتی محتوا
        """
        # ارسال درخواست POST به نمای آپلود تصویر
        response = self.client.post('/upload-image/')
        
        # بررسی هدرهای امنیتی
        self.assertIn('X-Content-Type-Options', response)
        self.assertIn('X-Frame-Options', response)
        self.assertIn('Content-Security-Policy', response)
        
        # بررسی مقادیر هدرها
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(response['X-Frame-Options'], 'SAMEORIGIN')
        self.assertIn('default-src', response['Content-Security-Policy'])


class XSSTestCase(TestCase):
    """
    تست‌های حملات XSS
    """
    
    def setUp(self):
        """
        راه‌اندازی تست‌ها
        """
        self.client = Client()
    
    def test_xss_in_content(self):
        """
        تست حمله XSS در محتوای ویرایشگر
        """
        # محتوای حاوی اسکریپت مخرب
        xss_content = '<p>متن عادی</p><script>alert("XSS")</script>'
        
        # ارسال محتوا به نمای ذخیره محتوا
        response = self.client.post(
            '/save-content/',
            data={'content': xss_content, 'field_id': 'test_field'},
            content_type='application/json'
        )
        
        # بررسی پاسخ
        self.assertEqual(response.status_code, 200)
        
        # بررسی اینکه اسکریپت مخرب حذف شده باشد
        # (این بخش نیاز به پیاده‌سازی بیشتر دارد)
