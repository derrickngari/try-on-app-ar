import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CheckCircle, XCircle, Info, X } from "lucide-react-native";
import Colors from "@/constants/colors";

const { height, width } = Dimensions.get("window");

type AlertType = "success" | "error" | "info";

interface AlertModalProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  autoDismiss?: number; // ms
  primaryButton?: { text: string; onPress: () => void };
}

const icons = {
  success: <CheckCircle size={48} color={Colors.success} />,
  error: <XCircle size={48} color={Colors.error} />,
  info: <Info size={48} color={Colors.primary} />,
};

export default function AlertModal({
  visible,
  type,
  title,
  message,
  onClose,
  autoDismiss,
  primaryButton,
}: AlertModalProps) {
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      if (autoDismiss) {
        const timer = setTimeout(onClose, autoDismiss);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible, autoDismiss, onClose, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      {/* Full-screen overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Full-screen card */}
        <Animated.View style={[styles.modal, animatedStyle]}>
          <BlurView intensity={90} tint="light" style={styles.blur} />

          <View style={styles.content}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>{icons[type]}</View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttons}>
              {primaryButton ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={onClose}
                  >
                    <Text style={styles.buttonSecondaryText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonPrimary,
                      type === "error" && styles.buttonError,
                      type === "success" && styles.buttonSuccess,
                    ]}
                    onPress={() => {
                      primaryButton.onPress();
                      onClose();
                    }}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {primaryButton.text}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    type === "success" && styles.buttonSuccess,
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonPrimaryText}>Got it</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    height: height * 0.65,
    width: "100%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonSuccess: {
    backgroundColor: Colors.success,
  },
  buttonError: {
    backgroundColor: Colors.error,
  },
  buttonSecondary: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
});