from django.apps import AppConfig


class PersianEditorConfig(AppConfig):
    name = 'persian_editor'
    verbose_name = 'ویرایشگر فارسی'
    default_auto_field = 'django.db.models.BigAutoField'
    
    def ready(self):
        """
        انجام تنظیمات اولیه هنگام بارگذاری برنامه
        """
        # می‌توانید کدهای مورد نیاز برای راه‌اندازی اولیه را اینجا قرار دهید
        pass
