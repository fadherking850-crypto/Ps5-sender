import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NEON = "#FF69B4";
const BG = "#000000";
const CARD = "#0D0D0D";
const BORDER = "#FF69B4";
const DIM_NEON = "#FF69B420";

const PAYLOADS = [
  "P2JB-Y2JB-Porting 2.6",
  "etaHEN v2.5B",
  "KStuff v1.6.7",
  "np-fake-signin 1.1",
  "FTPSrv v1.20",
  "FTPSrv 1.15-ng-beta8",
  "WebSRV v0.29",
  "nanoDNS v0.2",
  "ShadowMountPlus 1.6test11",
  "PS5Upload v1.5.3",
];

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const logRef = useRef<ScrollView>(null);

  const [ip, setIp] = useState("");
  const [port, setPort] = useState("9021");
  const [selectedPayload, setSelectedPayload] = useState(PAYLOADS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pkgFile, setPkgFile] = useState<{ name: string; uri: string } | null>(null);
  const [binFile, setBinFile] = useState<{ name: string; uri: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "🟢 النظام جاهز للاستخدام...",
    "⚡ الرجاء إدخال IP الخاص بـ PS5",
  ]);
  const [kstuffEnabled, setKstuffEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("ps5_ip").then((saved) => {
      if (saved) setIp(saved);
    });
  }, []);

  const saveIp = useCallback((val: string) => {
    setIp(val);
    AsyncStorage.setItem("ps5_ip", val);
  }, []);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-GB");
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
    setTimeout(() => logRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const validateIp = () => {
    if (!ip.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال IP الخاص بـ PS5");
      return false;
    }
    return true;
  };

  const pickPkg = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled && result.assets[0]) {
        setPkgFile({ name: result.assets[0].name, uri: result.assets[0].uri });
        addLog(`📦 تم اختيار الملف: ${result.assets[0].name}`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      addLog("❌ فشل في فتح منتقي الملفات");
    }
  };

  const pickBin = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled && result.assets[0]) {
        setBinFile({ name: result.assets[0].name, uri: result.assets[0].uri });
        addLog(`🗂️ تم اختيار ملف BIN: ${result.assets[0].name}`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      addLog("❌ فشل في فتح منتقي الملفات");
    }
  };

  const sendPkg = async () => {
    if (!validateIp()) return;
    if (!pkgFile) {
      Alert.alert("خطأ", "الرجاء اختيار ملف PKG أولاً");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addLog(`📤 جاري إرسال PKG إلى ${ip}:12800 ...`);
    try {
      const response = await fetch(`http://${ip}:12800/api/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "direct", packages: [pkgFile.uri] }),
      });
      if (response.ok) {
        addLog("✅ تم إرسال PKG بنجاح!");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        addLog(`⚠️ استجابة PS5: ${response.status}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`❌ فشل الاتصال: ${msg}`);
    }
  };

  const runPayload = async () => {
    if (!validateIp()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addLog(`🚀 جاري تشغيل الـ Payload: ${selectedPayload} على ${ip}:${port}`);
    try {
      const response = await fetch(`http://${ip}:${port}/`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: selectedPayload,
      });
      addLog(response.ok ? "✅ تم تشغيل الـ Payload!" : `⚠️ استجابة: ${response.status}`);
      if (response.ok) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`❌ خطأ TCP: ${msg}`);
    }
  };

  const clearCache = async () => {
    if (!validateIp()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addLog(`🧹 جاري مسح الكاش على ${ip}...`);
    try {
      const response = await fetch(`http://${ip}:12800/api/clear_cache`, {
        method: "POST",
      });
      addLog(response.ok ? "✅ تم مسح الكاش بنجاح!" : `⚠️ استجابة: ${response.status}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`❌ خطأ: ${msg}`);
    }
  };

  const toggleKstuff = async () => {
    if (!validateIp()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const action = kstuffEnabled ? "تعطيل" : "تفعيل";
    addLog(`⚙️ جاري ${action} KStuff على ${ip}...`);
    try {
      const response = await fetch(`http://${ip}:12800/api/kstuff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !kstuffEnabled }),
      });
      if (response.ok) {
        setKstuffEnabled(!kstuffEnabled);
        addLog(`✅ تم ${action} KStuff`);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        addLog(`⚠️ استجابة: ${response.status}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`❌ خطأ: ${msg}`);
    }
  };

  const autoLoad = async () => {
    if (!validateIp()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addLog(`🔄 جاري تشغيل AutoLoad على ${ip}...`);
    try {
      const response = await fetch(`http://${ip}:12800/api/autoload`, {
        method: "POST",
      });
      addLog(response.ok ? "✅ تم تفعيل AutoLoad!" : `⚠️ استجابة: ${response.status}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`❌ خطأ: ${msg}`);
    }
  };

  const sendBin = async () => {
    if (!validateIp()) return;
    if (!binFile) {
      Alert.alert("خطأ", "الرجاء اختيار ملف BIN أولاً");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addLog(`📡 جاري إرسال BIN عبر TCP إلى ${ip}:${port}...`);
    try {
      const b64 = await FileSystem.readAsStringAsync(binFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const response = await fetch(`http://${ip}:${port}/`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: bytes.buffer,
      });
      addLog(response.ok ? `✅ تم إرسال ${binFile.name} بنجاح!` : `⚠️ استجابة: ${response.status}`);
      if (response.ok) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`❌ خطأ إرسال BIN: ${msg}`);
    }
  };

  const clearLogs = () => setLogs([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <ImageBackground
        source={require("../../assets/images/dragon_bg.png")}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.dragonBg}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <Text style={styles.headerText}>👑 من صنع المبرمج فاضل شعلان هليل 🇮🇶</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎮 إعدادات الاتصال</Text>
          <TextInput
            style={styles.input}
            placeholder="PS5 IP Address (مثال: 192.168.1.100)"
            placeholderTextColor="#555"
            value={ip}
            onChangeText={saveIp}
            keyboardType="decimal-pad"
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="TCP Port (افتراضي: 9021)"
            placeholderTextColor="#555"
            value={port}
            onChangeText={setPort}
            keyboardType="number-pad"
            textAlign="right"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚡ اختيار الـ Payload</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
            <Text style={styles.dropdownText}>{selectedPayload}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📦 ملفات PKG & BIN</Text>
          <NeonButton
            label={pkgFile ? `📦 ${pkgFile.name}` : "اختر ملف PKG"}
            onPress={pickPkg}
            variant="outline"
          />
          <NeonButton
            label={binFile ? `🗂️ ${binFile.name}` : "اختر ملف BIN"}
            onPress={pickBin}
            variant="outline"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🕹️ التحكم</Text>
          <View style={styles.btnGrid}>
            <NeonButton label="إرسال PKG" onPress={sendPkg} flex />
            <NeonButton label="إرسال BIN" onPress={sendBin} flex />
          </View>
          <NeonButton label="تشغيل الـ Payload" onPress={runPayload} />
          <View style={styles.btnGrid}>
            <NeonButton label="مسح الكاش" onPress={clearCache} variant="danger" flex />
            <NeonButton
              label={kstuffEnabled ? "تعطيل KStuff" : "تفعيل KStuff"}
              onPress={toggleKstuff}
              variant={kstuffEnabled ? "active" : "outline"}
              flex
            />
          </View>
          <NeonButton label="تلقائي (AutoLoad)" onPress={autoLoad} variant="secondary" />
        </View>
      </ScrollView>

      <View style={[styles.logContainer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 4 }]}>
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>📟 سجل العمليات</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text style={styles.logClear}>مسح</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={logRef}
          style={styles.logScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => logRef.current?.scrollToEnd({ animated: true })}
        >
          {logs.map((l, i) => (
            <Text key={i} style={styles.logText}>{l}</Text>
          ))}
        </ScrollView>
      </View>

      <Modal visible={showDropdown} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>اختر الـ Payload</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PAYLOADS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.modalItem,
                    selectedPayload === p && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setSelectedPayload(p);
                    setShowDropdown(false);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.modalItemText, selectedPayload === p && { color: NEON }]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function NeonButton({
  label,
  onPress,
  variant = "primary",
  flex = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger" | "active" | "secondary";
  flex?: boolean;
}) {
  const getBg = () => {
    if (variant === "primary") return NEON;
    if (variant === "active") return "#FF69B480";
    if (variant === "danger") return "#FF3B3030";
    return "transparent";
  };
  const getBorder = () => {
    if (variant === "danger") return "#FF3B30";
    return NEON;
  };
  const getColor = () => {
    if (variant === "primary") return "#000";
    if (variant === "danger") return "#FF3B30";
    return NEON;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.neonBtn,
        { backgroundColor: getBg(), borderColor: getBorder() },
        flex && { flex: 1 },
      ]}
    >
      <Text
        style={[
          styles.neonBtnText,
          { color: getColor(), fontWeight: variant === "primary" ? "bold" : "600" },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  dragonBg: {
    opacity: 0.06,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "#000000CC",
  },
  headerText: {
    color: NEON,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FF69B430",
    padding: 14,
    gap: 10,
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sectionTitle: {
    color: NEON,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF69B460",
    color: "#FFF",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: "right",
  },
  dropdown: {
    backgroundColor: "#111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NEON,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: NEON,
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  dropdownArrow: {
    color: NEON,
    fontSize: 10,
    marginLeft: 8,
  },
  btnGrid: {
    flexDirection: "row",
    gap: 8,
  },
  neonBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  neonBtnText: {
    fontSize: 13,
    textAlign: "center",
  },
  logContainer: {
    height: 160,
    backgroundColor: "#000",
    borderTopWidth: 2,
    borderTopColor: NEON,
    shadowColor: NEON,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#FF69B430",
  },
  logTitle: {
    color: NEON,
    fontSize: 12,
    fontWeight: "700",
  },
  logClear: {
    color: "#888",
    fontSize: 11,
  },
  logScroll: {
    flex: 1,
    padding: 10,
  },
  logText: {
    color: "#00FF88",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000CC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#0D0D0D",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: NEON,
    padding: 16,
    width: "100%",
    maxHeight: 400,
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalTitle: {
    color: NEON,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemActive: {
    backgroundColor: "#FF69B415",
    borderWidth: 1,
    borderColor: "#FF69B460",
  },
  modalItemText: {
    color: "#CCC",
    fontSize: 14,
    textAlign: "right",
  },
});
