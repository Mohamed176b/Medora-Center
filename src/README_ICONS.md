# تعليمات تثبيت مكتبة Font Awesome

لاستخدام الأيقونات في صفحة إدارة الخدمات، يجب تثبيت حزم Font Awesome التالية:

```bash
npm install --save @fortawesome/fontawesome-svg-core
npm install --save @fortawesome/free-solid-svg-icons
npm install --save @fortawesome/free-regular-svg-icons
npm install --save @fortawesome/react-fontawesome
```

## كيفية الاستخدام

تم تكوين صفحة إدارة الخدمات لاستخدام أيقونات Font Awesome بدلاً من رفع صور للأيقونات. الصفحة تستخدم الاستيرادات التالية:

```javascript
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClinicMedical,
  faUserMd,
  faPills,
  faHeartbeat,
  faNotesMedical,
  // وغيرها من الأيقونات
} from "@fortawesome/free-solid-svg-icons";
```

وتقوم بتخزين اسم الأيقونة في قاعدة البيانات كنص (مثلاً: "faClinicMedical") وليس كمسار لملف صورة.

## ملاحظات إضافية

- تأكد من تثبيت الحزم المذكورة أعلاه قبل تشغيل التطبيق
- يمكنك إضافة المزيد من الأيقونات إلى مصفوفة `availableIcons` في ملف `ServicesManagement.js`
- يمكنك تعديل تصميم أنماط CSS في ملف `ServicesManagement.css`
