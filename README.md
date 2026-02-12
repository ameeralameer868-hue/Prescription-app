# MediCare Pro - تطبيق إدارة الوصفات الطبية

تطبيق Android لإدارة الوصفات الطبية مع قاعدة بيانات SQLite محلية.

## المميزات

- ✅ إنشاء وصفات طبية جديدة
- ✅ حفظ الوصفات في قاعدة بيانات SQLite محلية
- ✅ عرض قائمة الوصفات مع إمكانية البحث والتصفية
- ✅ طباعة الوصفات
- ✅ تخصيص إعدادات المستشفى (الاسم، الشعار، الألوان)
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ واجهة مستخدم سهلة الاستخدام

## متطلبات البناء

- Node.js (v14 أو أحدث)
- Cordova CLI
- Android SDK
- JDK 8 أو أحدث

## خطوات البناء

### 1. تثبيت Cordova CLI

```bash
npm install -g cordova
```

### 2. تثبيت التبعيات

```bash
cd prescription-app
npm install
```

### 3. إضافة منصة Android

```bash
cordova platform add android
```

### 4. بناء التطبيق (Debug)

```bash
cordova build android
```

### 5. بناء التطبيق (Release)

```bash
cordova build android --release
```

## ملف APK الناتج

بعد البناء بنجاح، ستجد ملف APK في:

```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

أو للنسخة النهائية:

```
platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## هيكل المشروع

```
prescription-app/
├── www/                    # ملفات الويب
│   ├── index.html         # الصفحة الرئيسية
│   └── app.js             # كود JavaScript
├── config.xml             # إعدادات Cordova
├── package.json           # تبعيات المشروع
└── README.md              # هذا الملف
```

## قاعدة البيانات

يستخدم التطبيق SQLite لتخزين البيانات محلياً على الجهاز:

### الجداول:

1. **prescriptions** - تخزين معلومات الوصفات
   - id, patient_name, patient_age, file_number
   - doctor_name, diagnosis, instructions
   - status, date, created_at

2. **medications** - تخزين الأدوية لكل وصفة
   - id, prescription_id, name, dose
   - frequency, duration, route

3. **settings** - تخزين إعدادات التطبيق
   - key, value

## الترخيص

MIT License
