import { useState, useEffect } from "react";
import {
  BOOTH_PACKAGES,
  BoothPackage,
  BoothSession,
  INITIAL_SESSION,
  LayoutOption,
  LAYOUTS,
  StripCustomization,
} from "@/types/layout";
import WelcomeScreen from "./WelcomeScreen";
import PackageSelector from "./PackageSelector";
import PaymentScreen from "./PaymentScreen";
import LayoutSelectionScreen from "./LayoutSelectionScreen";
import CameraView from "./CameraView";

const SESSION_KEY = "photobooth_session";

const SessionManager = () => {
  const [session, setSession] = useState<BoothSession>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
    return INITIAL_SESSION;
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  /* ---- Step transitions ---- */

  const startPhotobooth = () =>
    setSession((s) => ({
      ...s,
      step: "setup",
      selectedPackage: BOOTH_PACKAGES[2] || BOOTH_PACKAGES[0], // Premium package with all features
      isPaid: true,
    }));

  const selectPackage = (pkg: BoothPackage) =>
    setSession((s) => ({ ...s, step: "setup", selectedPackage: pkg, isPaid: true }));

  const onPaymentSuccess = () =>
    setSession((s) => ({ ...s, step: "setup", isPaid: true }));

  const onLayoutSelected = (layout: LayoutOption) =>
    setSession((s) => ({ ...s, step: "capture", selectedLayout: layout }));

  const handleRetake = () => {
    if (!session.selectedPackage) return;
    if (session.retakesUsed >= session.selectedPackage.maxRetakes) return;
    setSession((s) => ({
      ...s,
      step: "capture",
      retakesUsed: s.retakesUsed + 1,
    }));
  };

  const goToCustomize = () =>
    setSession((s) => ({ ...s, step: "customize" }));

  const resetSession = () => {
    setSession(INITIAL_SESSION);
    sessionStorage.removeItem(SESSION_KEY);
  };

  /* ---- Render current step ---- */

  switch (session.step) {
    case "welcome":
      return <WelcomeScreen onStart={startPhotobooth} />;

    case "package":
    case "payment":
      // Package & payment disabled temporarily: skip straight to layout setup
      setSession((s) => ({
        ...s,
        step: "setup",
        selectedPackage: s.selectedPackage || BOOTH_PACKAGES[2] || BOOTH_PACKAGES[0],
        isPaid: true,
      }));
      return null;

    case "setup":
      return session.selectedPackage ? (
        <LayoutSelectionScreen
          session={session}
          onSelect={onLayoutSelected}
          onBack={() => setSession((s) => ({ ...s, step: "welcome" }))}
        />
      ) : null;

    case "capture":
    case "customize":
      return session.selectedPackage ? (
        <CameraView
          boothSession={session}
          onRetake={handleRetake}
          onDone={goToCustomize}
          onReset={resetSession}
        />
      ) : null;

    default:
      return <WelcomeScreen onStart={startPhotobooth} />;
  }
};

export default SessionManager;
