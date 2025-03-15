/**
 * Persian Editor for Django
 * ========================
 * 
 * یک ویرایشگر متن غنی (WYSIWYG) با پشتیبانی کامل از زبان فارسی برای فریم‌ورک جنگو
 * 
 * نسخه: 1.0.0
 * توسعه‌دهنده: محمد رمضانیان
 * مجوز: MIT
 * 
 * این کتابخانه یک ویرایشگر متن پیشرفته با پشتیبانی کامل از RTL برای زبان فارسی ارائه می‌دهد.
 * ویژگی‌های اصلی:
 * - پشتیبانی کامل از راست به چپ (RTL)
 * - قالب‌بندی متن (ضخیم، مورب، زیرخط و...)
 * - درج لینک، تصویر و جدول
 * - پشتیبانی از حالت تاریک
 * - افکت‌های صوتی برای تایپ
 * - ذخیره خودکار محتوا
 * - رابط کاربری واکنش‌گرا
 * 
 * نحوه استفاده:
 * 1. اضافه کردن persian_editor به INSTALLED_APPS در settings.py
 * 2. استفاده از PersianEditorWidget در فرم‌ها یا PersianEditorField در مدل‌ها
 * 3. تنظیم MEDIA_URL و MEDIA_ROOT برای پشتیبانی از آپلود تصاویر
 * 
 * برای اطلاعات بیشتر به مستندات کامل در README.md مراجعه کنید.
 */

/**
 * ویرایشگر فارسی پیشرفته
 * نسخه بهبود یافته با رابط کاربری مدرن شبیه CKEditor 5
 */

// مقداردهی اولیه ویرایشگر
function initPersianEditor(elementId) {
    // عناصر اصلی ویرایشگر
    const editorDiv = document.getElementById(elementId + '_editor');
    const textarea = document.getElementById(elementId);
    const container = document.getElementById(elementId + '_container');
    const toolbar = document.getElementById(elementId + '_toolbar');
    
    if (!editorDiv || !textarea) {
        console.error('Persian Editor: Elements not found for ID ' + elementId);
        return;
    }
    
    // مخفی کردن تکست‌اریا
    textarea.style.display = "none";
    
    // کلید ذخیره‌سازی خودکار - منحصر به فرد برای هر فرم
    const formId = textarea.closest('form')?.id || 'default';
    const autosaveKey = "persian_editor_" + elementId + "_" + formId;
    
    // اگر محتوایی در تکست‌اریا وجود داشت، آن را در ویرایشگر نمایش دهیم
    if (textarea.value) {
        editorDiv.innerHTML = textarea.value;
    } 
    // در غیر این صورت اگر این یک فرم ویرایش است (نه ایجاد جدید)، از localStorage بازیابی کنیم
    else if (textarea.value === '' && window.location.href.includes('change') && localStorage.getItem(autosaveKey)) {
        editorDiv.innerHTML = localStorage.getItem(autosaveKey);
        textarea.value = editorDiv.innerHTML;
    }
    
    // تنظیم رویدادهای به‌روزرسانی محتوا
    editorDiv.addEventListener("blur", function() {
        updateTextarea(editorDiv, textarea, elementId);
    });
    
    editorDiv.addEventListener("input", function() {
        updateTextarea(editorDiv, textarea, elementId);
    });
    
    // پاک کردن localStorage در هنگام ارسال فرم
    const form = textarea.closest('form');
    if (form) {
        form.addEventListener('submit', function() {
            localStorage.removeItem(autosaveKey);
        });
    }
    
    // تنظیم رویدادهای دکمه‌های ابزار
    const buttons = toolbar.querySelectorAll('.editor-btn');
    buttons.forEach(button => {
        const command = button.getAttribute('data-command');
        const action = button.getAttribute('data-action');
        
        if (command) {
            button.addEventListener('click', function() {
                execCommand(command, editorDiv, textarea);
                
                // فعال کردن حالت فعال برای دکمه‌های قالب‌بندی
                if (['bold', 'italic', 'underline', 'strikeThrough', 'justifyRight', 'justifyCenter', 'justifyLeft', 'justifyFull'].includes(command)) {
                    toggleButtonState(this);
                } else {
                    // برای سایر دکمه‌ها، فقط نمایش موقت حالت فعال
                    this.classList.add('active');
                    setTimeout(() => {
                        this.classList.remove('active');
                    }, 200);
                }
            });
        } else if (action) {
            button.addEventListener('click', function() {
                handleAction(action, this, editorDiv, textarea, elementId);
            });
        }
    });
    
    // تنظیم رویدادهای انتخاب‌گر رنگ
    const colorPickers = toolbar.querySelectorAll('.editor-color-picker');
    colorPickers.forEach(picker => {
        const command = picker.getAttribute('data-command');
        picker.addEventListener('input', function() {
            const color = this.value;
            
            // به‌روزرسانی رنگ دکمه
            const colorBtn = this.parentElement.querySelector('.color-btn');
            if (colorBtn) {
                colorBtn.querySelector('i').style.color = color;
                if (command === 'hiliteColor') {
                    colorBtn.style.backgroundColor = color;
                }
            }
            
            execCommandWithValue(command, color, editorDiv, textarea);
        });
    });
    
    // تنظیم رویداد آپلود تصویر
    const imageInput = document.getElementById(elementId + '_image_input');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                uploadImage(this.files[0], editorDiv, textarea, elementId);
            }
        });
    }
    
    /**
     * اجرای دستور قالب‌بندی
     * 
     * این تابع دستورات قالب‌بندی متن را اجرا می‌کند.
     * 
     * @function execCommand
     * @param {string} command - دستور قالب‌بندی (مانند bold، italic و غیره)
     * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
     * @param {HTMLElement} textarea - المنت textarea اصلی
     * @returns {void}
     */
    function execCommand(command, editorDiv, textarea) {
        document.execCommand(command, false, null);
        editorDiv.focus();
        updateTextarea(editorDiv, textarea, elementId);
        updateButtonStates(toolbar);
    }
    
    // اجرای دستور با مقدار
    /**
     * اجرای دستور قالب‌بندی با مقدار
     * 
     * این تابع دستورات قالب‌بندی را با یک مقدار اضافی اجرا می‌کند (مانند رنگ متن، لینک و غیره).
     * 
     * @function execCommandWithValue
     * @param {string} command - دستور قالب‌بندی
     * @param {string} value - مقدار مورد نیاز برای دستور
     * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
     * @param {HTMLElement} textarea - المنت textarea اصلی
     * @returns {void}
     */
    function execCommandWithValue(command, value, editorDiv, textarea) {
        document.execCommand(command, false, value);
        editorDiv.focus();
        updateTextarea(editorDiv, textarea, elementId);
        updateButtonStates(toolbar);
    }
    
    // تغییر وضعیت دکمه (فعال/غیرفعال)
    function toggleButtonState(button) {
        const command = button.getAttribute('data-command');
        
        // بررسی وضعیت فعلی دستور
        const isActive = document.queryCommandState(command);
        
        // به‌روزرسانی کلاس دکمه
        if (isActive) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
    
    // به‌روزرسانی وضعیت دکمه‌ها بر اساس موقعیت مکان‌نما
    editorDiv.addEventListener('click', function() {
        updateButtonStates(toolbar);
    });
    
    editorDiv.addEventListener('keyup', function() {
        updateButtonStates(toolbar);
    });
    
    // به‌روزرسانی وضعیت همه دکمه‌ها
    function updateButtonStates(toolbar) {
        if (!toolbar) return;
        
        const formatButtons = toolbar.querySelectorAll('.editor-btn[data-command]');
        formatButtons.forEach(button => {
            const command = button.getAttribute('data-command');
            if (['bold', 'italic', 'underline', 'strikeThrough', 'justifyRight', 'justifyCenter', 'justifyLeft', 'justifyFull'].includes(command)) {
                try {
                    const isActive = document.queryCommandState(command);
                    if (isActive) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                } catch (e) {
                    console.error('Persian Editor: Error checking command state', command, e);
                }
            }
        });
    }
    
    // مدیریت اکشن‌های خاص
    /**
     * مدیریت اکشن‌های خاص ویرایشگر
     * 
     * این تابع اکشن‌های خاص مانند درج لینک، تصویر، جدول و غیره را مدیریت می‌کند.
     * 
     * @function handleAction
     * @param {string} action - نوع اکشن (link, image, table, html, fullscreen)
     * @param {HTMLElement} button - دکمه مربوط به اکشن
     * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
     * @param {HTMLElement} textarea - المنت textarea اصلی
     * @param {string} elementId - شناسه یکتای المنت
     * @returns {void}
     */
    function handleAction(action, button, editorDiv, textarea, elementId) {
        switch (action) {
            case 'link':
                insertLink(editorDiv, textarea);
                break;
            case 'image':
                triggerImageUpload(elementId);
                break;
            case 'table':
                insertTable(editorDiv, textarea);
                break;
            case 'html':
                toggleSourceView(button, editorDiv, textarea);
                break;
            case 'fullscreen':
                toggleFullscreen(button, editorDiv.closest('.persian-editor-container'));
                break;
        }
    }
    
    // درج لینک
    /**
     * درج لینک در ویرایشگر
     * 
     * این تابع برای درج لینک در متن انتخاب شده استفاده می‌شود.
     * ابتدا بررسی می‌کند که آیا متنی انتخاب شده است یا خیر، سپس آدرس لینک را از کاربر دریافت می‌کند
     * و لینک را به متن انتخاب شده اعمال می‌کند.
     * 
     * @function insertLink
     * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
     * @param {HTMLElement} textarea - المنت textarea اصلی
     * @returns {void}
     */
    function insertLink(editorDiv, textarea) {
        // ذخیره انتخاب فعلی
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        // اگر متنی انتخاب نشده باشد، پیام نمایش بده
        if (!selectedText || selectedText.trim() === '') {
            showNotification('لطفاً ابتدا متنی را انتخاب کنید', 'warning');
            return;
        }
        
        // نمایش پنجره درخواست آدرس لینک
        const url = prompt('لطفاً آدرس لینک را وارد کنید:', 'http://');
        
        if (url && url !== 'http://') {
            // حفظ موقعیت انتخاب
            const range = selection.getRangeAt(0);
            
            // ایجاد المنت لینک
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            
            // کپی محتوای انتخاب شده به داخل لینک
            range.surroundContents(linkElement);
            
            // به‌روزرسانی تکست‌اریا
            updateTextarea(editorDiv, textarea, elementId);
            
            // نمایش پیام موفقیت
            showNotification('لینک با موفقیت اضافه شد', 'success');
        }
    }
    
    // فعال‌سازی آپلود تصویر
    function triggerImageUpload(elementId) {
        const imageInput = document.getElementById(elementId + '_image_input');
        if (imageInput) {
            imageInput.click();
        }
    }
    
    // آپلود تصویر
    function uploadImage(file, editorDiv, textarea, elementId) {
        // نمایش نشانگر بارگذاری
        const loadingIndicator = createLoadingIndicator();
        container.appendChild(loadingIndicator);
        
        const formData = new FormData();
        formData.append('image', file);
        
        // دریافت CSRF token از کوکی
        const csrftoken = getCookie('csrftoken');
        
        // ارسال درخواست AJAX با استفاده از مسیر امن
        fetch('/persian_editor/upload-image/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('خطا در آپلود تصویر');
            }
            return response.json();
        })
        .then(data => {
            // حذف نشانگر بارگذاری
            container.removeChild(loadingIndicator);
            
            if (data.success && data.url) {
                // درج تصویر در ویرایشگر
                const img = document.createElement('img');
                img.src = data.url;
                img.alt = 'تصویر آپلود شده';
                img.style.maxWidth = '100%';
                
                // درج تصویر در محل مکان‌نما
                document.execCommand('insertHTML', false, img.outerHTML);
                
                // به‌روزرسانی تکست‌اریا
                updateTextarea(editorDiv, textarea, elementId);
                
                // نمایش پیام موفقیت
                showNotification('تصویر با موفقیت اضافه شد', 'success');
            } else {
                showNotification(data.error || 'خطا در آپلود تصویر', 'error');
            }
        })
        .catch(error => {
            // حذف نشانگر بارگذاری
            if (container.contains(loadingIndicator)) {
                container.removeChild(loadingIndicator);
            }
            
            console.error('Persian Editor: Error uploading image', error);
            showNotification('خطا در آپلود تصویر: ' + error.message, 'error');
        });
    }
    
    // دریافت مقدار کوکی
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // درج تصویر در موقعیت مکان‌نما
    function insertImageAtCursor(imageUrl, editorDiv, textarea) {
        // فوکوس بر روی ویرایشگر
        editorDiv.focus();
        
        // ایجاد تصویر
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'تصویر آپلود شده';
        img.style.maxWidth = '100%';
        img.className = 'editor-image';
        
        // درج تصویر
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        
        // به‌روزرسانی تکست‌اریا
        updateTextarea(editorDiv, textarea, elementId);
        
        // نمایش پیام موفقیت
        showNotification('تصویر با موفقیت اضافه شد', 'success');
    }
    
    // انتخاب تصویر
    function selectImage(img) {
        // حذف کلاس selected از همه تصاویر
        const images = editorDiv.querySelectorAll('img');
        images.forEach(image => {
            image.classList.remove('selected');
        });
        
        // افزودن کلاس selected به تصویر انتخاب شده
        img.classList.add('selected');
    }
    
    // نمایش تنظیمات تصویر
    function showImageSettings(img) {
        // حذف تنظیمات قبلی اگر وجود داشته باشد
        const existingSettings = document.querySelector('.image-settings');
        if (existingSettings) {
            existingSettings.remove();
        }
        
        // ایجاد منوی تنظیمات
        const settings = document.createElement('div');
        settings.className = 'image-settings';
        
        // محتوای تنظیمات
        settings.innerHTML = `
            <div class="image-settings-header">تنظیمات تصویر</div>
            
            <div class="image-settings-group">
                <label for="image_width">عرض تصویر:</label>
                <input type="range" id="image_width" min="10" max="100" value="${parseInt(img.style.width) || 100}" class="image-width-slider">
                <span class="image-width-value">${parseInt(img.style.width) || 100}%</span>
            </div>
            
            <div class="image-settings-group">
                <label>تراز تصویر:</label>
                <div class="image-settings-buttons">
                    <button type="button" class="image-settings-btn align-btn ${img.style.float === 'right' ? 'active' : ''}" data-align="right">
                        <i class="bi bi-align-end"></i>
                    </button>
                    <button type="button" class="image-settings-btn align-btn ${!img.style.float ? 'active' : ''}" data-align="center">
                        <i class="bi bi-align-center"></i>
                    </button>
                    <button type="button" class="image-settings-btn align-btn ${img.style.float === 'left' ? 'active' : ''}" data-align="left">
                        <i class="bi bi-align-start"></i>
                    </button>
                </div>
            </div>
            
            <div class="image-settings-buttons">
                <button type="button" class="editor-btn editor-btn-danger" id="remove_image">
                    <i class="bi bi-trash"></i> حذف تصویر
                </button>
            </div>
        `;
        
        // موقعیت منوی تنظیمات
        const imgRect = img.getBoundingClientRect();
        const editorRect = editorDiv.getBoundingClientRect();
        
        settings.style.top = (imgRect.bottom - editorRect.top + editorDiv.scrollTop + 10) + 'px';
        settings.style.left = (imgRect.left - editorRect.left + editorDiv.scrollLeft) + 'px';
        
        // افزودن به ویرایشگر
        editorDiv.appendChild(settings);
        
        // تنظیم رویدادها
        const widthSlider = settings.querySelector('.image-width-slider');
        const widthValue = settings.querySelector('.image-width-value');
        
        // رویداد تغییر عرض
        widthSlider.addEventListener('input', function() {
            const width = this.value;
            img.style.width = width + '%';
            widthValue.textContent = width + '%';
            updateTextarea(editorDiv, textarea, elementId);
        });
        
        // رویداد تغییر تراز
        const alignButtons = settings.querySelectorAll('.align-btn');
        alignButtons.forEach(button => {
            button.addEventListener('click', function() {
                const align = this.getAttribute('data-align');
                
                // حذف کلاس active از همه دکمه‌ها
                alignButtons.forEach(btn => btn.classList.remove('active'));
                
                // افزودن کلاس active به دکمه انتخاب شده
                this.classList.add('active');
                
                // تنظیم تراز تصویر
                if (align === 'right') {
                    img.style.float = 'right';
                    img.style.marginLeft = '15px';
                    img.style.marginRight = '0';
                } else if (align === 'left') {
                    img.style.float = 'left';
                    img.style.marginRight = '15px';
                    img.style.marginLeft = '0';
                } else {
                    img.style.float = '';
                    img.style.marginLeft = 'auto';
                    img.style.marginRight = 'auto';
                    img.style.display = 'block';
                }
                
                updateTextarea(editorDiv, textarea, elementId);
            });
        });
        
        // رویداد حذف تصویر
        const removeButton = settings.querySelector('#remove_image');
        removeButton.addEventListener('click', function() {
            img.remove();
            settings.remove();
            updateTextarea(editorDiv, textarea, elementId);
        });
        
        // بستن تنظیمات با کلیک خارج از آن
        document.addEventListener('click', function closeSettings(e) {
            if (!settings.contains(e.target) && e.target !== img) {
                settings.remove();
                document.removeEventListener('click', closeSettings);
            }
        });
    }
    
    // درج جدول
    /**
     * درج جدول در ویرایشگر
     * 
     * این تابع برای ایجاد و درج جدول در ویرایشگر استفاده می‌شود.
     * از کاربر تعداد سطرها و ستون‌های جدول را دریافت می‌کند و یک جدول با خطوط مشخص ایجاد می‌کند.
     * جدول ایجاد شده دارای حاشیه‌های مشخص و استایل‌های پایه است.
     * 
     * @function insertTable
     * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
     * @param {HTMLElement} textarea - المنت textarea اصلی
     * @returns {void}
     */
    function insertTable(editorDiv, textarea) {
        // درخواست تعداد سطرها و ستون‌ها
        const rows = parseInt(prompt('تعداد سطرها:', '3'));
        const cols = parseInt(prompt('تعداد ستون‌ها:', '3'));
        
        if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
            showNotification('لطفاً مقادیر معتبر وارد کنید', 'error');
            return;
        }
        
        // ایجاد جدول با استایل بوردر
        let tableHTML = '<table style="width:100%; border-collapse:collapse; margin:10px 0;">';
        
        // ایجاد سطرها و ستون‌ها
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                // اضافه کردن استایل بوردر به سلول‌ها
                tableHTML += '<td style="border:1px solid #ccc; padding:8px; min-width:30px; min-height:20px;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        
        tableHTML += '</table>';
        
        // درج جدول در محل مکان‌نما
        document.execCommand('insertHTML', false, tableHTML);
        
        // به‌روزرسانی تکست‌اریا
        updateTextarea(editorDiv, textarea, elementId);
        
        // نمایش پیام موفقیت
        showNotification('جدول با موفقیت اضافه شد', 'success');
    }
    
    // تغییر حالت نمایش HTML
    function toggleSourceView(button, editorDiv, textarea) {
        const sourceView = editorDiv.getAttribute('data-source-view') === 'true';
        
        if (sourceView) {
            // تبدیل به حالت عادی
            editorDiv.innerHTML = editorDiv.textContent;
            editorDiv.setAttribute('data-source-view', 'false');
            editorDiv.style.fontFamily = '';
            editorDiv.style.whiteSpace = '';
            editorDiv.style.direction = 'rtl';
            editorDiv.style.textAlign = '';
            editorDiv.style.backgroundColor = '';
            button.classList.remove('active');
        } else {
            // تبدیل به حالت HTML
            editorDiv.textContent = editorDiv.innerHTML;
            editorDiv.setAttribute('data-source-view', 'true');
            editorDiv.style.fontFamily = 'monospace';
            editorDiv.style.whiteSpace = 'pre-wrap';
            editorDiv.style.direction = 'ltr';
            editorDiv.style.textAlign = 'left';
            editorDiv.style.backgroundColor = '#f8f9fa';
            button.classList.add('active');
        }
        
        // به‌روزرسانی تکست‌اریا
        updateTextarea(editorDiv, textarea, elementId);
    }
    
    // تغییر حالت تمام صفحه
    function toggleFullscreen(button, container) {
        container.classList.toggle('fullscreen');
        
        // به‌روزرسانی وضعیت دکمه
        if (container.classList.contains('fullscreen')) {
            button.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            button.title = 'خروج از حالت تمام صفحه';
        } else {
            button.innerHTML = '<i class="bi bi-fullscreen"></i>';
            button.title = 'تمام صفحه';
        }
    }
    
    // اضافه کردن افکت تایپ با صدا
    let isSoundEnabled = false;
    
    // ایجاد صدای تایپ با استفاده از AudioContext
    /**
     * ایجاد صدای تایپ
     * 
     * این تابع با استفاده از Web Audio API یک صدای تایپ واقعی ایجاد می‌کند.
     * صدا با استفاده از نویز سفید و فیلترهای مناسب تولید می‌شود تا به صدای تایپ واقعی نزدیک باشد.
     * 
     * @function playTypingSound
     * @returns {void}
     */
    function playTypingSound() {
        try {
            // ایجاد یک AudioContext جدید برای هر صدا
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // ایجاد یک بافر صدا کوتاه
            const bufferSize = audioContext.sampleRate * 0.05; // 50 میلی‌ثانیه
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            // ایجاد صدای تایپ با نویز سفید و فیلتر
            for (let i = 0; i < bufferSize; i++) {
                // نویز سفید با دامنه کاهشی
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            
            // ایجاد منبع صدا
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            
            // ایجاد فیلتر برای صدای تایپ
            const filter = audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000 + Math.random() * 500;
            filter.Q.value = 5;
            
            // ایجاد تقویت‌کننده برای کنترل صدا
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.2;
            
            // اتصال منبع به فیلتر، فیلتر به تقویت‌کننده و تقویت‌کننده به خروجی
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // پخش صدا
            source.start();
            
            // کاهش تدریجی صدا
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            // بستن AudioContext بعد از اتمام صدا
            setTimeout(() => {
                audioContext.close().catch(err => console.error('خطا در بستن AudioContext:', err));
            }, 100);
        } catch (error) {
            console.error('خطا در پخش صدای تایپ:', error);
        }
    }
    
    // دکمه فعال/غیرفعال کردن صدا
    const soundButton = document.createElement('button');
    soundButton.className = 'editor-btn';
    soundButton.innerHTML = '<i class="bi bi-volume-mute"></i>';
    soundButton.title = 'فعال/غیرفعال کردن صدای تایپ';
    soundButton.setAttribute('data-command', 'sound');
    
    soundButton.addEventListener('click', function(e) {
        // جلوگیری از ارسال فرم در صفحه ادمین
        e.preventDefault();
        e.stopPropagation();
        
        isSoundEnabled = !isSoundEnabled;
        
        if (isSoundEnabled) {
            // پخش یک صدای کوتاه برای تست
            playTypingSound();
            
            soundButton.innerHTML = '<i class="bi bi-volume-up"></i>';
            soundButton.classList.add('active');
            showNotification('صدای تایپ فعال شد', 'info');
        } else {
            soundButton.innerHTML = '<i class="bi bi-volume-mute"></i>';
            soundButton.classList.remove('active');
            showNotification('صدای تایپ غیرفعال شد', 'info');
        }
        
        return false;
    });
    
    // اضافه کردن دکمه صدا به نوار ابزار
    const lastGroup = toolbar.querySelector('.toolbar-group:last-child');
    const soundGroup = document.createElement('div');
    soundGroup.className = 'toolbar-group';
    soundGroup.appendChild(soundButton);
    toolbar.insertBefore(soundGroup, lastGroup.nextSibling);
    
    // اضافه کردن رویداد keydown برای صدای تایپ
    editorDiv.addEventListener('keydown', function(e) {
        // فقط برای کلیدهای حروف و اعداد و کاراکترهای خاص صدا پخش کن
        if (isSoundEnabled && (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete' || e.key === ' ')) {
            // استفاده از setTimeout برای جلوگیری از تداخل با عملیات تایپ
            setTimeout(() => {
                playTypingSound();
            }, 0);
        }
    });
    
    // اضافه کردن افکت کانفتی برای جشن گرفتن
    const confettiButton = document.createElement('button');
    confettiButton.className = 'editor-btn';
    confettiButton.innerHTML = '<i class="bi bi-stars"></i>';
    confettiButton.title = 'جشن گرفتن!';
    
    confettiButton.addEventListener('click', function() {
        showConfetti();
        showNotification('🎉 مبارک باشه! 🎊', 'success');
    });
    
    // اضافه کردن دکمه کانفتی به نوار ابزار
    soundGroup.appendChild(confettiButton);
    
    // تابع نمایش کانفتی
    function showConfetti() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const confetti = [];
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        
        // ایجاد ذرات کانفتی
        for (let i = 0; i < 200; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: -Math.random() * canvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * 6.28,
                rotation: Math.random() * 0.2 - 0.1,
                rotationSpeed: Math.random() * 0.01
            });
        }
        
        // انیمیشن کانفتی
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let stillFalling = false;
            
            confetti.forEach(particle => {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.angle);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                particle.y += particle.speed;
                particle.x += Math.sin(particle.y * 0.01) * 2;
                particle.angle += particle.rotationSpeed;
                
                if (particle.y < canvas.height) {
                    stillFalling = true;
                }
            });
            
            if (stillFalling) {
                requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        }
        
        animate();
    }
    
    // ایجاد دیالوگ
    function createDialog({ title, content, onConfirm }) {
        // ایجاد overlay
        const overlay = document.createElement('div');
        overlay.className = 'editor-dialog-overlay';
        
        // ایجاد دیالوگ
        const dialog = document.createElement('div');
        dialog.className = 'editor-dialog';
        dialog.innerHTML = `
            <div class="editor-dialog-header">${title}</div>
            <div class="editor-dialog-body">${content}</div>
            <div class="editor-dialog-footer">
                <button type="button" class="editor-dialog-btn editor-dialog-btn-primary" id="dialog-confirm">تایید</button>
                <button type="button" class="editor-dialog-btn editor-dialog-btn-secondary" id="dialog-cancel">لغو</button>
            </div>
        `;
        
        // افزودن دیالوگ به overlay
        overlay.appendChild(dialog);
        
        // تنظیم رویدادها
        const confirmBtn = dialog.querySelector('#dialog-confirm');
        const cancelBtn = dialog.querySelector('#dialog-cancel');
        
        confirmBtn.addEventListener('click', function() {
            if (typeof onConfirm === 'function') {
                onConfirm(dialog);
            }
        });
        
        cancelBtn.addEventListener('click', function() {
            closeDialog(overlay);
        });
        
        // بستن دیالوگ با کلیک خارج از آن
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeDialog(overlay);
            }
        });
        
        // بستن دیالوگ با کلید ESC
        document.addEventListener('keydown', function escClose(e) {
            if (e.key === 'Escape') {
                closeDialog(overlay);
                document.removeEventListener('keydown', escClose);
            }
        });
        
        return overlay;
    }
    
    // بستن دیالوگ
    function closeDialog(dialog) {
        document.body.removeChild(dialog);
    }
    
    // ایجاد نشانگر بارگذاری
    function createLoadingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'editor-loading';
        loading.innerHTML = '<div class="editor-loading-spinner"></div>';
        
        return loading;
    }
    
    // نمایش اعلان
    function showNotification(message, type = 'info') {
        // حذف اعلان‌های قبلی
        const existingNotifications = document.querySelectorAll('.editor-notification');
        existingNotifications.forEach(notification => {
            notification.classList.add('editor-notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // ایجاد اعلان جدید
        const notification = document.createElement('div');
        notification.className = `editor-notification editor-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // حذف خودکار اعلان بعد از چند ثانیه
        setTimeout(() => {
            notification.classList.add('editor-notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // فراخوانی اولیه به‌روزرسانی وضعیت دکمه‌ها
    updateButtonStates(toolbar);
}

// اضافه کردن کلاس به المنت
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else {
        element.className += ' ' + className;
    }
}

// حذف کلاس از المنت
function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

// اجرای خودکار ویرایشگر برای همه المنت‌های دارای کلاس persian-editor
document.addEventListener('DOMContentLoaded', function() {
    // فعال‌سازی ویرایشگر برای همه تکست‌اریاهای دارای کلاس persian-editor
    const textareas = document.querySelectorAll('textarea.persian-editor');
    
    textareas.forEach(textarea => {
        const id = textarea.id;
        if (id) {
            // ایجاد کانتینر ویرایشگر اگر وجود نداشت
            if (!document.getElementById(id + '_container')) {
                console.log('ایجاد ویرایشگر برای:', id);
                
                // ایجاد کانتینر
                const container = document.createElement('div');
                container.id = id + '_container';
                container.className = 'persian-editor-container';
                
                // ایجاد نوار ابزار
                const toolbar = document.createElement('div');
                toolbar.id = id + '_toolbar';
                toolbar.className = 'editor-toolbar';
                
                // ایجاد محتوای ویرایشگر
                const editor = document.createElement('div');
                editor.id = id + '_editor';
                editor.className = 'editor-content';
                editor.contentEditable = true;
                editor.dir = 'rtl';
                editor.innerHTML = textarea.value;
                
                // ایجاد input فایل برای آپلود تصویر
                const imageInput = document.createElement('input');
                imageInput.type = 'file';
                imageInput.id = id + '_image_input';
                imageInput.style.display = 'none';
                imageInput.accept = 'image/*';
                
                // افزودن اجزا به کانتینر
                container.appendChild(toolbar);
                container.appendChild(editor);
                container.appendChild(imageInput);
                
                // جایگزینی تکست‌اریا با ویرایشگر
                textarea.parentNode.insertBefore(container, textarea);
                textarea.style.display = 'none';
                
                // اینجا دیگر initPersianEditor را فراخوانی نمی‌کنیم
                // به جای آن، مستقیماً کد لازم را اجرا می‌کنیم
                setupEditor(id, editor, textarea, toolbar, container, imageInput);
            }
        }
    });
    
    // اضافه کردن رویداد کلیک به همه دکمه‌ها در ادمین
    // این کد مشکل کار نکردن دکمه‌ها در صفحه ادمین را حل می‌کند
    setTimeout(function() {
        const adminForms = document.querySelectorAll('.form-row');
        if (adminForms.length > 0) {
            // در صفحه ادمین هستیم
            const allButtons = document.querySelectorAll('.editor-btn');
            
            allButtons.forEach(function(button) {
                const originalClickEvent = button.onclick;
                
                button.onclick = function(e) {
                    // جلوگیری از ارسال فرم
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // اجرای رویداد اصلی
                    if (originalClickEvent) {
                        originalClickEvent.call(this, e);
                    }
                    
                    return false;
                };
            });
            
            console.log('رویدادهای کلیک دکمه‌ها در ادمین اصلاح شد');
        }
    }, 1000);
});

/**
 * تابع راه‌اندازی ویرایشگر فارسی
 * 
 * این تابع مسئول راه‌اندازی و پیکربندی یک نمونه ویرایشگر فارسی است.
 * 
 * @function setupEditor
 * @param {string} elementId - شناسه یکتای المنت
 * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
 * @param {HTMLElement} textarea - المنت textarea اصلی
 * @param {HTMLElement} toolbar - المنت نوار ابزار
 * @param {HTMLElement} container - المنت کانتینر ویرایشگر
 * @param {HTMLElement} imageInput - المنت ورودی آپلود تصویر
 * @returns {void}
 */
function setupEditor(elementId, editorDiv, textarea, toolbar, container, imageInput) {
    console.log('راه‌اندازی ویرایشگر برای:', elementId);
    
    // ایجاد دکمه‌های ابزار
    createToolbarButtons(toolbar, editorDiv, textarea, elementId);
    
    // تنظیم رویدادهای به‌روزرسانی محتوا
    editorDiv.addEventListener("blur", function() {
        updateTextarea(editorDiv, textarea, elementId);
    });
    
    editorDiv.addEventListener("input", function() {
        updateTextarea(editorDiv, textarea, elementId);
    });
    
    // پاک کردن localStorage در هنگام ارسال فرم
    const form = textarea.closest('form');
    if (form) {
        form.addEventListener('submit', function() {
            const formId = form.id || 'default';
            const autosaveKey = "persian_editor_" + elementId + "_" + formId;
            localStorage.removeItem(autosaveKey);
        });
    }
    
    // به‌روزرسانی وضعیت دکمه‌ها بر اساس موقعیت مکان‌نما
    editorDiv.addEventListener('click', function() {
        updateButtonStates(toolbar);
    });
    
    editorDiv.addEventListener('keyup', function() {
        updateButtonStates(toolbar);
    });
    
    // تنظیم رویداد آپلود تصویر
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                uploadImage(this.files[0], editorDiv, textarea, elementId);
            }
        });
    }
    
    // فراخوانی اولیه به‌روزرسانی وضعیت دکمه‌ها
    updateButtonStates(toolbar);
}

/**
 * ایجاد دکمه‌های نوار ابزار ویرایشگر
 * 
 * این تابع مسئول ایجاد تمام دکمه‌های نوار ابزار ویرایشگر است، شامل دکمه‌های قالب‌بندی، تراز، لیست، و ابزارهای اضافی.
 * همچنین دکمه صدای تایپ و رویدادهای مربوط به آن را نیز تنظیم می‌کند.
 * 
 * @function createToolbarButtons
 * @param {HTMLElement} toolbar - المنت نوار ابزار
 * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
 * @param {HTMLElement} textarea - المنت textarea اصلی
 * @param {string} elementId - شناسه یکتای المنت
 * @returns {void}
 */
function createToolbarButtons(toolbar, editorDiv, textarea, elementId) {
    // گروه دکمه‌های قالب‌بندی متن
    const formatGroup = document.createElement('div');
    formatGroup.className = 'toolbar-group';
    
    // دکمه‌های قالب‌بندی
    const formatButtons = [
        { command: 'bold', icon: 'bi bi-type-bold', title: 'ضخیم' },
        { command: 'italic', icon: 'bi bi-type-italic', title: 'مورب' },
        { command: 'underline', icon: 'bi bi-type-underline', title: 'زیرخط' },
        { command: 'strikeThrough', icon: 'bi bi-type-strikethrough', title: 'خط‌خورده' }
    ];
    
    formatButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'editor-btn';
        button.innerHTML = `<i class="${btn.icon}"></i>`;
        button.title = btn.title;
        button.setAttribute('data-command', btn.command);
        
        button.addEventListener('click', function() {
            execCommand(btn.command, editorDiv, textarea);
            
            // فعال کردن حالت فعال برای دکمه‌های قالب‌بندی
            toggleButtonState(this);
        });
        
        formatGroup.appendChild(button);
    });
    
    // گروه دکمه‌های تراز متن
    const alignGroup = document.createElement('div');
    alignGroup.className = 'toolbar-group';
    
    // دکمه‌های تراز
    const alignButtons = [
        { command: 'justifyRight', icon: 'bi bi-text-right', title: 'تراز راست' },
        { command: 'justifyCenter', icon: 'bi bi-text-center', title: 'وسط‌چین' },
        { command: 'justifyLeft', icon: 'bi bi-text-left', title: 'تراز چپ' },
        { command: 'justifyFull', icon: 'bi bi-justify', title: 'تراز کامل' }
    ];
    
    alignButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'editor-btn';
        button.innerHTML = `<i class="${btn.icon}"></i>`;
        button.title = btn.title;
        button.setAttribute('data-command', btn.command);
        
        button.addEventListener('click', function() {
            execCommand(btn.command, editorDiv, textarea);
            
            // فعال کردن حالت فعال برای دکمه‌های تراز
            toggleButtonState(this);
        });
        
        alignGroup.appendChild(button);
    });
    
    // گروه دکمه‌های لیست
    const listGroup = document.createElement('div');
    listGroup.className = 'toolbar-group';
    
    // دکمه‌های لیست
    const listButtons = [
        { command: 'insertUnorderedList', icon: 'bi bi-list-ul', title: 'لیست نامرتب' },
        { command: 'insertOrderedList', icon: 'bi bi-list-ol', title: 'لیست مرتب' }
    ];
    
    listButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'editor-btn';
        button.innerHTML = `<i class="${btn.icon}"></i>`;
        button.title = btn.title;
        button.setAttribute('data-command', btn.command);
        
        button.addEventListener('click', function() {
            execCommand(btn.command, editorDiv, textarea);
            
            // فعال کردن حالت فعال برای دکمه‌های لیست
            toggleButtonState(this);
        });
        
        listGroup.appendChild(button);
    });
    
    // گروه دکمه‌های اضافی
    const extraGroup = document.createElement('div');
    extraGroup.className = 'toolbar-group';
    
    // دکمه‌های اضافی
    const extraButtons = [
        { action: 'link', icon: 'bi bi-link-45deg', title: 'درج لینک' },
        { action: 'image', icon: 'bi bi-image', title: 'درج تصویر' },
        { action: 'table', icon: 'bi bi-table', title: 'درج جدول' },
        { action: 'html', icon: 'bi bi-code-slash', title: 'ویرایش HTML' },
        { action: 'fullscreen', icon: 'bi bi-arrows-fullscreen', title: 'تمام‌صفحه' }
    ];
    
    extraButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'editor-btn';
        button.innerHTML = `<i class="${btn.icon}"></i>`;
        button.title = btn.title;
        button.setAttribute('data-action', btn.action);
        
        button.addEventListener('click', function() {
            handleAction(btn.action, this, editorDiv, textarea, elementId);
        });
        
        extraGroup.appendChild(button);
    });
    
    // اضافه کردن دکمه صدای تایپ
    const soundGroup = document.createElement('div');
    soundGroup.className = 'toolbar-group';
    
    const soundButton = document.createElement('button');
    soundButton.className = 'editor-btn';
    soundButton.innerHTML = '<i class="bi bi-volume-mute"></i>';
    soundButton.title = 'فعال/غیرفعال کردن صدای تایپ';
    soundButton.setAttribute('data-command', 'sound');
    
    let isSoundEnabled = false;
    
    soundButton.addEventListener('click', function(e) {
        // جلوگیری از ارسال فرم در صفحه ادمین
        e.preventDefault();
        e.stopPropagation();
        
        isSoundEnabled = !isSoundEnabled;
        
        if (isSoundEnabled) {
            // پخش یک صدای کوتاه برای تست
            playTypingSound();
            
            soundButton.innerHTML = '<i class="bi bi-volume-up"></i>';
            soundButton.classList.add('active');
            showNotification('صدای تایپ فعال شد', 'info');
        } else {
            soundButton.innerHTML = '<i class="bi bi-volume-mute"></i>';
            soundButton.classList.remove('active');
            showNotification('صدای تایپ غیرفعال شد', 'info');
        }
        
        return false;
    });
    
    soundGroup.appendChild(soundButton);
    
    // اضافه کردن رویداد keydown برای صدای تایپ
    editorDiv.addEventListener('keydown', function(e) {
        // فقط برای کلیدهای حروف و اعداد و کاراکترهای خاص صدا پخش کن
        if (isSoundEnabled && (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete' || e.key === ' ')) {
            // استفاده از setTimeout برای جلوگیری از تداخل با عملیات تایپ
            setTimeout(() => {
                playTypingSound();
            }, 0);
        }
    });
    
    // اضافه کردن همه گروه‌ها به نوار ابزار
    toolbar.appendChild(formatGroup);
    toolbar.appendChild(alignGroup);
    toolbar.appendChild(listGroup);
    toolbar.appendChild(extraGroup);
    toolbar.appendChild(soundGroup);
}

// اجرای دستور قالب‌بندی
/**
 * اجرای دستور قالب‌بندی
 * 
 * این تابع دستورات قالب‌بندی متن را اجرا می‌کند.
 * 
 * @function execCommand
 * @param {string} command - دستور قالب‌بندی (مانند bold، italic و غیره)
 * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
 * @param {HTMLElement} textarea - المنت textarea اصلی
 * @returns {void}
 */
function execCommand(command, editorDiv, textarea) {
    document.execCommand(command, false, null);
    editorDiv.focus();
    updateTextarea(editorDiv, textarea);
    updateButtonStates();
}

// اجرای دستور با مقدار
/**
 * اجرای دستور قالب‌بندی با مقدار
 * 
 * این تابع دستورات قالب‌بندی را با یک مقدار اضافی اجرا می‌کند (مانند رنگ متن، لینک و غیره).
 * 
 * @function execCommandWithValue
 * @param {string} command - دستور قالب‌بندی
 * @param {string} value - مقدار مورد نیاز برای دستور
 * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
 * @param {HTMLElement} textarea - المنت textarea اصلی
 * @returns {void}
 */
function execCommandWithValue(command, value, editorDiv, textarea) {
    document.execCommand(command, false, value);
    editorDiv.focus();
    updateTextarea(editorDiv, textarea);
    updateButtonStates();
}

/**
 * به‌روزرسانی تکست‌اریا و ذخیره خودکار
 * 
 * این تابع محتوای ویرایشگر را در textarea اصلی به‌روزرسانی می‌کند و همچنین
 * محتوا را به صورت خودکار در localStorage ذخیره می‌کند تا در صورت بستن مرورگر یا رفرش صفحه،
 * محتوای ویرایشگر از بین نرود.
 * 
 * @function updateTextarea
 * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
 * @param {HTMLElement} textarea - المنت textarea اصلی
 * @param {string} elementId - شناسه یکتای المنت برای ذخیره در localStorage
 * @returns {void}
 */
function updateTextarea(editorDiv, textarea, elementId) {
    textarea.value = editorDiv.innerHTML;
    
    // ذخیره خودکار در localStorage
    if (elementId) {
        const formId = textarea.closest('form')?.id || 'default';
        const autosaveKey = "persian_editor_" + elementId + "_" + formId;
        localStorage.setItem(autosaveKey, editorDiv.innerHTML);
    }
}

// تغییر وضعیت دکمه (فعال/غیرفعال)
function toggleButtonState(button) {
    const command = button.getAttribute('data-command');
    
    // بررسی وضعیت فعلی دستور
    const isActive = document.queryCommandState(command);
    
    // به‌روزرسانی کلاس دکمه
    if (isActive) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}

// به‌روزرسانی وضعیت همه دکمه‌ها
function updateButtonStates(toolbar) {
    if (!toolbar) return;
    
    const formatButtons = toolbar.querySelectorAll('.editor-btn[data-command]');
    formatButtons.forEach(button => {
        const command = button.getAttribute('data-command');
        if (['bold', 'italic', 'underline', 'strikeThrough', 'justifyRight', 'justifyCenter', 'justifyLeft', 'justifyFull'].includes(command)) {
            try {
                const isActive = document.queryCommandState(command);
                if (isActive) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            } catch (e) {
                console.error('Persian Editor: Error checking command state', command, e);
            }
        }
    });
}

// مدیریت اکشن‌های خاص
/**
 * مدیریت اکشن‌های خاص ویرایشگر
 * 
 * این تابع اکشن‌های خاص مانند درج لینک، تصویر، جدول و غیره را مدیریت می‌کند.
 * 
 * @function handleAction
 * @param {string} action - نوع اکشن (link, image, table, html, fullscreen)
 * @param {HTMLElement} button - دکمه مربوط به اکشن
 * @param {HTMLElement} editorDiv - المنت DIV ویرایشگر
 * @param {HTMLElement} textarea - المنت textarea اصلی
 * @param {string} elementId - شناسه یکتای المنت
 * @returns {void}
 */
function handleAction(action, button, editorDiv, textarea, elementId) {
    switch (action) {
        case 'link':
            insertLink(editorDiv, textarea);
            break;
        case 'image':
            triggerImageUpload(elementId);
            break;
        case 'table':
            insertTable(editorDiv, textarea);
            break;
        case 'html':
            toggleSourceView(button, editorDiv, textarea);
            break;
        case 'fullscreen':
            toggleFullscreen(button, editorDiv.closest('.persian-editor-container'));
            break;
    }
}

// ایجاد صدای تایپ با استفاده از AudioContext
/**
 * ایجاد صدای تایپ
 * 
 * این تابع با استفاده از Web Audio API یک صدای تایپ واقعی ایجاد می‌کند.
 * صدا با استفاده از نویز سفید و فیلترهای مناسب تولید می‌شود تا به صدای تایپ واقعی نزدیک باشد.
 * 
 * @function playTypingSound
 * @returns {void}
 */
function playTypingSound() {
    try {
        // ایجاد یک AudioContext جدید برای هر صدا
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // ایجاد یک بافر صدا کوتاه
        const bufferSize = audioContext.sampleRate * 0.05; // 50 میلی‌ثانیه
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // ایجاد صدای تایپ با نویز سفید و فیلتر
        for (let i = 0; i < bufferSize; i++) {
            // نویز سفید با دامنه کاهشی
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        
        // ایجاد منبع صدا
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        
        // ایجاد فیلتر برای صدای تایپ
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000 + Math.random() * 500;
        filter.Q.value = 5;
        
        // ایجاد تقویت‌کننده برای کنترل صدا
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.2;
        
        // اتصال منبع به فیلتر، فیلتر به تقویت‌کننده و تقویت‌کننده به خروجی
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // پخش صدا
        source.start();
        
        // کاهش تدریجی صدا
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        // بستن AudioContext بعد از اتمام صدا
        setTimeout(() => {
            audioContext.close().catch(err => console.error('خطا در بستن AudioContext:', err));
        }, 100);
    } catch (error) {
        console.error('خطا در پخش صدای تایپ:', error);
    }
}
