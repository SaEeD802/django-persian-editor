from django.forms.widgets import Textarea
from django.utils.safestring import mark_safe
from django.conf import settings

class PersianEditorWidget(Textarea):
    class Media:
        js = (
            'persian_editor/js/editor.js',
        )
        css = {
            'all': ('persian_editor/css/editor.css',)
        }

    def render(self, name, value, attrs=None, renderer=None):
        if attrs is None:
            attrs = {}
        
        # اطمینان از وجود id برای ویرایشگر
        element_id = attrs.get('id', f'id_{name}')
        attrs['id'] = element_id
        
        # رندر textarea اصلی
        textarea_html = super().render(name, value, attrs, renderer)
        
        # ایجاد ساختار HTML ویرایشگر
        html = f'''
            <div class="persian-editor-container" id="{element_id}_container">
                <div id="{element_id}_toolbar" class="editor-toolbar">
                    <div class="toolbar-group formatting-group">
                        <button type="button" class="editor-btn" data-command="undo" title="واگرد">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="redo" title="از نو">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-group formatting-group">
                        <button type="button" class="editor-btn" data-command="bold" title="ضخیم">
                            <i class="bi bi-type-bold"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="italic" title="مورب">
                            <i class="bi bi-type-italic"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="underline" title="زیرخط">
                            <i class="bi bi-type-underline"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="strikeThrough" title="خط‌خورده">
                            <i class="bi bi-type-strikethrough"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-group paragraph-group">
                        <button type="button" class="editor-btn" data-command="justifyRight" title="تراز راست">
                            <i class="bi bi-text-right"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="justifyCenter" title="تراز وسط">
                            <i class="bi bi-text-center"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="justifyLeft" title="تراز چپ">
                            <i class="bi bi-text-left"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="justifyFull" title="تراز دوطرفه">
                            <i class="bi bi-justify"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-group list-group">
                        <button type="button" class="editor-btn" data-command="insertOrderedList" title="لیست شماره‌دار">
                            <i class="bi bi-list-ol"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="insertUnorderedList" title="لیست نقطه‌ای">
                            <i class="bi bi-list-ul"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="indent" title="افزایش تورفتگی">
                            <i class="bi bi-text-indent-right"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="outdent" title="کاهش تورفتگی">
                            <i class="bi bi-text-indent-left"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-group insert-group">
                        <button type="button" class="editor-btn" data-action="link" title="درج لینک">
                            <i class="bi bi-link-45deg"></i>
                        </button>
                        <button type="button" class="editor-btn" data-action="image" title="درج تصویر">
                            <i class="bi bi-image"></i>
                        </button>
                        <button type="button" class="editor-btn" data-action="table" title="درج جدول">
                            <i class="bi bi-table"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-group style-group">
                        <div class="color-picker-wrapper" title="رنگ متن">
                            <input type="color" id="{element_id}_text_color" data-command="foreColor" class="editor-color-picker">
                            <button type="button" class="editor-btn color-btn">
                                <i class="bi bi-type-color"></i>
                            </button>
                        </div>
                        <div class="color-picker-wrapper" title="رنگ پس‌زمینه">
                            <input type="color" id="{element_id}_bg_color" data-command="hiliteColor" class="editor-color-picker">
                            <button type="button" class="editor-btn color-btn">
                                <i class="bi bi-paint-bucket"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="toolbar-group view-group">
                        <button type="button" class="editor-btn" data-action="html" title="نمایش HTML">
                            <i class="bi bi-code-slash"></i>
                        </button>
                        <button type="button" class="editor-btn" data-command="removeFormat" title="حذف قالب‌بندی">
                            <i class="bi bi-eraser"></i>
                        </button>
                        <button type="button" class="editor-btn" data-action="fullscreen" title="تمام صفحه">
                            <i class="bi bi-fullscreen"></i>
                        </button>
                    </div>
                </div>
                
                <div id="{element_id}_editor" class="editor-content" contenteditable="true" dir="rtl" data-source-view="false">
                    {value or ''}
                </div>
                
                <input type="file" id="{element_id}_image_input" style="display: none;" accept="image/*">
            </div>
            {textarea_html}
            <script>
                document.addEventListener("DOMContentLoaded", function() {{
                    initPersianEditor("{element_id}");
                }});
            </script>
        '''
        
        return mark_safe(html)
