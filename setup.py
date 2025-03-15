#!/usr/bin/env python
"""
بسته‌بندی ویرایشگر فارسی برای Django

این فایل برای بسته‌بندی و انتشار ویرایشگر فارسی در PyPI استفاده می‌شود.
"""

import os
from setuptools import setup, find_packages

# خواندن فایل README.md
with open(os.path.join(os.path.dirname(__file__), 'README.md'), encoding='utf-8') as readme:
    README = readme.read()

# خواندن فایل requirements.txt
with open(os.path.join(os.path.dirname(__file__), 'requirements.txt'), encoding='utf-8') as requirements:
    REQUIREMENTS = [line.strip() for line in requirements if line.strip()]

setup(
    name='django-persian-editor',
    version='1.0.1',
    packages=find_packages(exclude=['demo_project', 'tests']),
    include_package_data=True,
    license='MIT',
    description='یک ویرایشگر متن فارسی پیشرفته برای Django با پشتیبانی از RTL، حالت تاریک و امنیت بالا',
    long_description=README,
    long_description_content_type='text/markdown',
    url='https://github.com/SaEeD802/django-persian-editor',
    author='Persian Editor Team',
    author_email='persianeditor.ir@gmail.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 3.2',
        'Framework :: Django :: 4.0',
        'Framework :: Django :: 4.1',
        'Framework :: Django :: 4.2',
        'Framework :: Django :: 5.0',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Topic :: Text Processing :: Markup :: HTML',
        'Natural Language :: Persian',
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'Intended Audience :: Education',
    ],
    install_requires=[
        'Django>=3.2',
        'bleach>=6.0.0',
        'python-magic-bin>=0.4.14',
        'tinycss2>=1.4.0',
    ],
    python_requires='>=3.8',
    keywords='django,editor,persian,rtl,wysiwyg,text,html,dark-mode,security',
    project_urls={
        'Documentation': 'https://github.com/SaEeD802/django-persian-editor',
        'Source': 'https://github.com/SaEeD802/django-persian-editor',
        'Tracker': 'https://github.com/SaEeD802/django-persian-editor/issues',
        'Changelog': 'https://github.com/SaEeD802/django-persian-editor/blob/main/CHANGELOG.md',
        'Security': 'https://github.com/SaEeD802/django-persian-editor/blob/main/SECURITY.md',
    },
    zip_safe=False,
)
