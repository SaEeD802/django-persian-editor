"""
میدل‌ورهای ویرایشگر فارسی

این ماژول شامل میدل‌ورهای مربوط به ویرایشگر فارسی است،
از جمله میدل‌ور امنیتی برای اضافه کردن هدرهای امنیتی به تمام پاسخ‌ها.
"""

from .security import get_secure_content_headers


class SecurityHeadersMiddleware:
    """
    میدل‌ور اضافه کردن هدرهای امنیتی به تمام پاسخ‌ها
    
    این میدل‌ور هدرهای امنیتی مانند Content-Security-Policy را به تمام پاسخ‌های HTTP اضافه می‌کند.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # اضافه کردن هدرهای امنیتی به پاسخ
        if hasattr(request, 'path') and request.path.startswith('/persian_editor/'):
            headers = get_secure_content_headers()
            for header, value in headers.items():
                response[header] = value
        
        return response
