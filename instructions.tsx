import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NEON = "#FF69B4";
const BG = "#000000";
const CARD = "#0D0D0D";

const steps = [
  {
    category: "🌐 إعداد الشبكة",
    items: [
      {
        step: "1",
        title: "اتصال الشبكة",
        desc: "تأكد أن PS5 والهاتف متصلان بنفس شبكة WiFi المنزلية. اذهب إلى إعدادات PS5 ← الشبكة ← إعدادات الشبكة.",
      },
      {
        step: "2",
        title: "معرفة IP الخاص بـ PS5",
        desc: "اذهب إلى: الإعدادات ← الشبكة ← عرض حالة الاتصال. ستجد عنوان IP مثل: 192.168.1.XXX. أدخله في حقل IP.",
      },
      {
        step: "3",
        title: "تعطيل جدار الحماية",
        desc: "في بعض الراوترات، قد تحتاج إلى تعطيل الـ Firewall مؤقتاً أو إضافة PS5 إلى قائمة الأجهزة الموثوقة (DMZ).",
      },
    ],
  },
  {
    category: "⚡ اختراق PS5 عبر P2JB",
    items: [
      {
        step: "4",
        title: "متطلبات P2JB",
        desc: "تأكد أن PS5 يعمل على إصدار Firmware مدعوم. يدعم P2JB حالياً إصدارات محددة — تحقق من الموقع الرسمي لآخر الإصدارات المدعومة.",
      },
      {
        step: "5",
        title: "تشغيل الـ Jailbreak",
        desc: "افتح PS5 وانتقل إلى متصفح الإنترنت المدمج. أدخل رابط صفحة P2JB للاتصال. انتظر حتى يكتمل الاختراق — قد يستغرق من 1 إلى 5 دقائق.",
      },
      {
        step: "6",
        title: "تأكيد نجاح الـ Jailbreak",
        desc: "بعد النجاح ستظهر رسالة تأكيد على PS5. الآن ستستطيع الاتصال عبر الهاتف. اختر Payload مناسباً (مثل etaHEN v2.5B) واضغط 'تشغيل الـ Payload'.",
      },
    ],
  },
  {
    category: "📦 تثبيت ملفات PKG",
    items: [
      {
        step: "7",
        title: "تفعيل خادم التثبيت",
        desc: "أولاً قم بتشغيل Payload مناسب (مثل etaHEN أو KStuff). هذا يفعّل خادم HTTP على المنفذ 12800 في PS5.",
      },
      {
        step: "8",
        title: "اختيار ملف PKG",
        desc: "اضغط على 'اختر ملف PKG' واختر الملف المطلوب من هاتفك. يجب أن يكون الملف موجوداً على ذاكرة الهاتف.",
      },
      {
        step: "9",
        title: "إرسال الـ PKG",
        desc: "بعد اختيار الملف اضغط 'إرسال PKG'. سيتم إرسال طلب التثبيت إلى PS5 على المنفذ 12800. انتظر رسالة 'تم الإرسال بنجاح' في سجل العمليات.",
      },
      {
        step: "10",
        title: "متابعة التثبيت على PS5",
        desc: "بعد الإرسال الناجح، انتقل إلى مكتبة ألعاب PS5 أو قائمة التطبيقات. ستجد الـ PKG يتم تثبيته تلقائياً.",
      },
    ],
  },
  {
    category: "🛠️ نصائح متقدمة",
    items: [
      {
        step: "11",
        title: "FTPSrv — نقل الملفات",
        desc: "شغّل Payload 'FTPSrv v1.20' للوصول إلى نظام ملفات PS5 عبر برنامج FTP (مثل FileZilla). المنفذ الافتراضي: 1337.",
      },
      {
        step: "12",
        title: "KStuff — تفعيل مزايا إضافية",
        desc: "KStuff يتيح تشغيل ألعاب من أقراص إصدارات مختلفة. استخدم زر 'تفعيل/تعطيل KStuff' للتحكم.",
      },
      {
        step: "13",
        title: "مسح الكاش",
        desc: "في حالة حدوث أخطاء أو تجميد، استخدم 'مسح الكاش في PS5' لإعادة ضبط الذاكرة المؤقتة.",
      },
      {
        step: "14",
        title: "AutoLoad",
        desc: "وظيفة التحميل التلقائي تشغّل الـ Payload المختار تلقائياً عند بدء الجهاز. تأكد من اختيار الـ Payload الصحيح أولاً.",
      },
    ],
  },
];

export default function InstructionsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: topPad }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>📖 طريقة التشغيل</Text>
        <Text style={styles.headerSub}>دليل خطوة بخطوة لاستخدام التطبيق</Text>
      </View>

      {steps.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.categoryTitle}>{section.category}</Text>
          {section.items.map((item) => (
            <View key={item.step} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ تنبيه مهم</Text>
        <Text style={styles.warningText}>
          هذا التطبيق مخصص للأغراض التعليمية والبحثية فقط. استخدم على مسؤوليتك الخاصة.
          تأكد دائماً من أمان شبكتك قبل البدء.
        </Text>
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerText}>👑 من صنع المبرمج فاضل شعلان هليل 🇮🇶</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 14,
    gap: 12,
  },
  headerCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: NEON,
    padding: 18,
    alignItems: "center",
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerTitle: {
    color: NEON,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSub: {
    color: "#888",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  section: {
    gap: 8,
  },
  categoryTitle: {
    color: NEON,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    paddingRight: 4,
    marginBottom: 2,
  },
  stepCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF69B425",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF69B420",
    borderWidth: 1.5,
    borderColor: NEON,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumber: {
    color: NEON,
    fontSize: 13,
    fontWeight: "bold",
  },
  stepBody: {
    flex: 1,
    alignItems: "flex-end",
  },
  stepTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 4,
  },
  stepDesc: {
    color: "#AAA",
    fontSize: 12,
    textAlign: "right",
    lineHeight: 19,
  },
  warningCard: {
    backgroundColor: "#1A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
    padding: 14,
    gap: 8,
  },
  warningTitle: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  warningText: {
    color: "#CC8888",
    fontSize: 12,
    textAlign: "right",
    lineHeight: 19,
  },
  footerCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF69B430",
    padding: 14,
    alignItems: "center",
  },
  footerText: {
    color: NEON,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
