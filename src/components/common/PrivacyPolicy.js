import React from "react";
import styles from "../../style/CommonPages.module.css";


const PrivacyPolicy = () => {
  React.useEffect(() => {
    document.title = "سياسة الخصوصية | مركز ميدورا";
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>سياسة الخصوصية</h1>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>جمع المعلومات</h2>
          <p>نحن نجمع المعلومات التي تقدمها لنا عندما:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>تقوم بإنشاء حساب في منصتنا</li>
            <li className={styles.listItem}>تحجز موعداً مع أحد أطبائنا</li>
            <li className={styles.listItem}>تتواصل معنا عبر نموذج الاتصال</li>
            <li className={styles.listItem}>تشترك في نشرتنا الإخبارية</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>استخدام المعلومات</h2>
          <p>نستخدم المعلومات التي نجمعها لـ:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>تقديم وتحسين خدماتنا</li>
            <li className={styles.listItem}>تأكيد وإدارة المواعيد الطبية</li>
            <li className={styles.listItem}>التواصل معك بخصوص خدماتنا</li>
            <li className={styles.listItem}>إرسال معلومات مهمة عن حسابك</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>حماية المعلومات</h2>
          <p>
            نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح
            به والإفصاح عنها. نستخدم بروتوكولات تشفير قياسية لحماية معلوماتك
            الشخصية.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>مشاركة المعلومات</h2>
          <p>
            لا نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك
            معلوماتك فقط في الحالات التالية:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>عندما نحصل على موافقتك</li>
            <li className={styles.listItem}>لأغراض قانونية</li>
            <li className={styles.listItem}>
              مع مقدمي الخدمات الموثوقين لدينا
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>تحديثات السياسة</h2>
          <p>
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات
            جوهرية عن طريق نشر إشعار على موقعنا.
          </p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(PrivacyPolicy);
