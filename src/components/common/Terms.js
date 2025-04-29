import React from "react";
import styles from "../../style/CommonPages.module.css";

const Terms = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>الشروط والأحكام</h1>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>مقدمة</h2>
          <p>
            مرحباً بك في مركز ميدورا. باستخدامك لموقعنا وخدماتنا، فإنك توافق على
            الالتزام بهذه الشروط والأحكام. يرجى قراءة هذه الشروط بعناية قبل
            استخدام خدماتنا.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>المواعيد والحجوزات</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              يجب الوصول قبل 15 دقيقة من موعدك المحدد
            </li>
            <li className={styles.listItem}>
              في حالة التأخر لأكثر من 15 دقيقة، قد يتم إلغاء موعدك
            </li>
            <li className={styles.listItem}>
              يجب إخطارنا قبل 24 ساعة على الأقل لإلغاء أو تغيير موعدك
            </li>
            <li className={styles.listItem}>
              قد يتم فرض رسوم على المواعيد الملغاة في وقت متأخر
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>الخدمات الطبية</h2>
          <p>نلتزم بتقديم أفضل رعاية طبية ممكنة، ومع ذلك:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              نتائج العلاج قد تختلف من شخص لآخر
            </li>
            <li className={styles.listItem}>يجب اتباع تعليمات الطبيب بدقة</li>
            <li className={styles.listItem}>
              يجب الإفصاح عن جميع المعلومات الطبية المهمة
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>المدفوعات والرسوم</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              يجب دفع الرسوم كاملة قبل تلقي الخدمة
            </li>
            <li className={styles.listItem}>
              نقبل الدفع نقداً وببطاقات الائتمان
            </li>
            <li className={styles.listItem}>قد تتغير الأسعار دون إشعار مسبق</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>السلوك والتعامل</h2>
          <p>نتوقع من جميع المرضى والزوار:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              التعامل باحترام مع الطاقم الطبي والإداري
            </li>
            <li className={styles.listItem}>الحفاظ على نظافة وهدوء المركز</li>
            <li className={styles.listItem}>
              اتباع إرشادات السلامة والتعليمات
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>تعديل الشروط</h2>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر
            التغييرات على موقعنا، واستمرارك في استخدام خدماتنا يعني موافقتك على
            الشروط المعدلة.
          </p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(Terms);
