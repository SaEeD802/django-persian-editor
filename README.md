# ویرایشگر متن فارسی برای جنگو (Persian Editor for Django)

<div align="center">
  <h3>ویرایشگر متن پیشرفته فارسی برای جنگو</h3>
  <p>یک ویرایشگر متن غنی (WYSIWYG) با پشتیبانی کامل از زبان فارسی برای فریم‌ورک جنگو</p>
  
  ![Python](https://img.shields.io/badge/Python-3.6+-blue.svg)
  ![Django](https://img.shields.io/badge/Django-3.2+-green.svg)
  ![License](https://img.shields.io/badge/License-MIT-yellow.svg)
  ![RTL Support](https://img.shields.io/badge/RTL-Supported-orange.svg)
</div>

## ویژگی‌ها

✨ **پشتیبانی کامل از راست به چپ (RTL)** - طراحی شده به صورت اختصاصی برای زبان فارسی  
🎨 **رابط کاربری مدرن** - ظاهری زیبا و کاربرپسند با پشتیبانی از حالت تاریک  
📱 **واکنش‌گرا** - سازگار با تمام دستگاه‌ها از موبایل تا دسکتاپ  
🔌 **ادغام آسان** - نصب و پیکربندی ساده در پروژه‌های جنگو  
🛠️ **قابلیت‌های پیشرفته** - قالب‌بندی متن، درج لینک، تصویر، جدول و...  
🔊 **افکت‌های صوتی** - صدای تایپ برای تجربه کاربری بهتر  
🌙 **حالت تاریک** - پشتیبانی از حالت تاریک برای کار در محیط‌های کم‌نور  
💾 **ذخیره خودکار** - ذخیره محتوا به صورت خودکار برای جلوگیری از از دست رفتن اطلاعات  

## نصب

### ۱. نصب با استفاده از pip

```bash
pip install django-persian-editor
```

### ۲. اضافه کردن به INSTALLED_APPS

در فایل `settings.py` پروژه خود، `persian_editor` را به لیست `INSTALLED_APPS` اضافه کنید:

```python
INSTALLED_APPS = [
    # ...
    'persian_editor',
    # ...
]
```

### ۳. اضافه کردن URL‌ها

در فایل `urls.py` پروژه خود، URL‌های ویرایشگر را اضافه کنید:

```python
from django.urls import path, include

urlpatterns = [
    # ...
    path('persian-editor/', include('persian_editor.urls')),
    # ...
]
```

### ۴. تنظیمات رسانه (Media)

برای آپلود تصاویر، مطمئن شوید که تنظیمات رسانه به درستی پیکربندی شده‌اند:

```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

و در فایل `urls.py` اصلی:

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ...
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### ۵. اجرای مایگریشن‌ها

```bash
python manage.py migrate
```

## استفاده

### استفاده در فرم‌ها

```python
from django import forms
from persian_editor.widgets import PersianEditorWidget

class ArticleForm(forms.Form):
    title = forms.CharField(max_length=100)
    content = forms.CharField(widget=PersianEditorWidget())
```

### استفاده در مدل‌ها

```python
from django.db import models
from persian_editor.fields import PersianEditorField

class Article(models.Model):
    title = models.CharField(max_length=100)
    content = PersianEditorField()
```

### استفاده در ادمین جنگو

```python
from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'content')
```

## شخصی‌سازی

### تنظیمات پیش‌فرض

می‌توانید تنظیمات پیش‌فرض ویرایشگر را در فایل `settings.py` خود تغییر دهید:

```python
# تنظیمات ویرایشگر فارسی
PERSIAN_EDITOR_CONFIG = {
    'height': '400px',
    'toolbar_buttons': [
        'bold', 'italic', 'underline', 'strikeThrough',
        'justifyRight', 'justifyCenter', 'justifyLeft', 'justifyFull',
        'insertUnorderedList', 'insertOrderedList',
        'link', 'image', 'table', 'html', 'fullscreen'
    ],
    'enable_sound': True,
    'enable_autosave': True,
    'autosave_interval': 60000,  # میلی‌ثانیه
    'enable_dark_mode': True,
    'default_direction': 'rtl',
    'upload_image_path': 'persian_editor/uploads/',
}
```

### شخصی‌سازی ویجت

می‌توانید تنظیمات را به صورت موردی برای هر ویجت تغییر دهید:

```python
from persian_editor.widgets import PersianEditorWidget

content = forms.CharField(
    widget=PersianEditorWidget(
        config={
            'height': '300px',
            'enable_sound': False,
            'toolbar_buttons': ['bold', 'italic', 'link']
        }
    )
)
```

## رویدادها و API جاوااسکریپت

ویرایشگر فارسی دارای API جاوااسکریپت قدرتمندی است که می‌توانید از آن برای تعامل با ویرایشگر استفاده کنید:

```javascript
// دسترسی به نمونه ویرایشگر
const editor = PersianEditor.getInstance('element_id');

// دریافت محتوا
const content = editor.getContent();

// تنظیم محتوا
editor.setContent('<p>محتوای جدید</p>');

// افزودن محتوا به انتهای متن
editor.appendContent('<p>متن اضافه شده</p>');

// پاک کردن محتوا
editor.clear();

// فعال/غیرفعال کردن ویرایشگر
editor.enable();
editor.disable();

// گوش دادن به رویدادها
editor.on('change', function(content) {
    console.log('محتوا تغییر کرد:', content);
});

editor.on('focus', function() {
    console.log('ویرایشگر فوکوس شد');
});

editor.on('blur', function() {
    console.log('ویرایشگر فوکوس را از دست داد');
});
```

## رویدادهای سفارشی

می‌توانید رویدادهای سفارشی را برای ویرایشگر تعریف کنید:

```javascript
// تعریف یک رویداد سفارشی
PersianEditor.defineEvent('customEvent', function(editor, data) {
    // پیاده‌سازی رویداد
});

// فراخوانی رویداد سفارشی
editor.trigger('customEvent', { key: 'value' });
```

## افزونه‌ها

ویرایشگر فارسی از سیستم افزونه پشتیبانی می‌کند. می‌توانید افزونه‌های خود را به شکل زیر ایجاد کنید:

```javascript
// تعریف یک افزونه
PersianEditor.definePlugin('myPlugin', {
    init: function(editor) {
        // مقداردهی اولیه افزونه
        console.log('افزونه من فعال شد');
        
        // افزودن دکمه به نوار ابزار
        editor.addToolbarButton({
            name: 'myButton',
            icon: 'bi bi-star',
            title: 'دکمه سفارشی',
            action: function() {
                alert('دکمه سفارشی کلیک شد!');
            }
        });
    },
    
    destroy: function(editor) {
        // پاکسازی منابع هنگام حذف افزونه
    }
});

// فعال‌سازی افزونه
PersianEditor.activatePlugin('myPlugin');
```

## مثال‌ها

### مثال ۱: فرم ساده با ویرایشگر فارسی

```python
# forms.py
from django import forms
from persian_editor.widgets import PersianEditorWidget

class SimpleForm(forms.Form):
    content = forms.CharField(widget=PersianEditorWidget())

# views.py
from django.shortcuts import render, redirect
from .forms import SimpleForm

def simple_form_view(request):
    if request.method == 'POST':
        form = SimpleForm(request.POST)
        if form.is_valid():
            # پردازش داده‌ها
            return redirect('success')
    else:
        form = SimpleForm()
    
    return render(request, 'simple_form.html', {'form': form})

# simple_form.html
{% extends 'base.html' %}

{% block content %}
<h1>فرم ساده</h1>
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">ارسال</button>
</form>
{% endblock %}
```

### مثال ۲: استفاده در مدل و ادمین

```python
# models.py
from django.db import models
from persian_editor.fields import PersianEditorField

class Article(models.Model):
    title = models.CharField(max_length=100, verbose_name='عنوان')
    content = PersianEditorField(verbose_name='محتوا')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = 'مقاله'
        verbose_name_plural = 'مقالات'

# admin.py
from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'content')
```

## امنیت

ویرایشگر فارسی با در نظر گرفتن امنیت طراحی شده است و شامل ویژگی‌های امنیتی زیر است:

### پاکسازی HTML

برای جلوگیری از حملات XSS، ویرایشگر فارسی به طور خودکار محتوای HTML را پاکسازی می‌کند:

```python
from persian_editor.security import clean_html

# پاکسازی محتوای HTML
cleaned_content = clean_html(content)
```

### امنیت آپلود فایل

برای اطمینان از امنیت آپلود فایل‌ها، ویرایشگر فارسی از بررسی‌های امنیتی زیر استفاده می‌کند:

```python
from persian_editor.security import validate_image_file

# بررسی امنیتی فایل تصویر
validate_image_file(uploaded_file)
```

### هدرهای امنیتی

برای بهبود امنیت، ویرایشگر فارسی هدرهای امنیتی مانند Content-Security-Policy را اضافه می‌کند:

```python
# اضافه کردن میدل‌ور امنیتی
MIDDLEWARE = [
    # ...
    'persian_editor.middleware.SecurityHeadersMiddleware',
    # ...
]
```

برای اطلاعات بیشتر در مورد امنیت، به فایل [SECURITY.md](SECURITY.md) مراجعه کنید.

## حالت تاریک

ویرایشگر فارسی به طور خودکار از حالت تاریک پشتیبانی می‌کند و با تنظیمات سیستم کاربر هماهنگ می‌شود:

```css
@media (prefers-color-scheme: dark) {
    .persian-editor {
        background-color: #2d2d2d;
        color: #f0f0f0;
    }
    
    .persian-editor-toolbar {
        background-color: #333;
        border-color: #444;
    }
    
    /* سایر استایل‌های حالت تاریک */
}
```

## واکنش‌گرایی

ویرایشگر فارسی برای استفاده در دستگاه‌های موبایل بهینه‌سازی شده است:

```css
@media (max-width: 768px) {
    .persian-editor-toolbar {
        flex-wrap: wrap;
    }
    
    .persian-editor-toolbar button {
        padding: 6px;
    }
    
    /* سایر استایل‌های واکنش‌گرا */
}
```

## انتشار در PyPI

برای انتشار ویرایشگر فارسی در PyPI، مراحل زیر را دنبال کنید:

```bash
# نصب ابزارهای لازم
pip install setuptools wheel twine

# ساخت بسته توزیع
python setup.py sdist bdist_wheel

# آپلود به PyPI
twine upload dist/*
```

## مشارکت

از مشارکت شما در توسعه ویرایشگر فارسی استقبال می‌کنیم! برای مشارکت، مراحل زیر را دنبال کنید:

1. پروژه را فورک کنید
2. یک شاخه جدید ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. تغییرات خود را کامیت کنید (`git commit -m 'Add some amazing feature'`)
4. شاخه را به مخزن خود پوش کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request ایجاد کنید

## مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای اطلاعات بیشتر، به فایل [LICENSE](LICENSE) مراجعه کنید.

## تماس با ما

اگر سوال یا پیشنهادی دارید، می‌توانید از طریق ایمیل یا GitHub با ما در تماس باشید:

- ایمیل: [persianeditor.ir@gmail.com](mailto:persianeditor.ir@gmail.com)
- GitHub: [https://github.com/SaEeD802/django-persian-editor](https://github.com/SaEeD802/django-persian-editor)

---

<div align="center">
  <p>با افتخار ساخته شده در ایران ❤️</p>
  <p>Persian Editor for Django © 2025</p>
</div>
