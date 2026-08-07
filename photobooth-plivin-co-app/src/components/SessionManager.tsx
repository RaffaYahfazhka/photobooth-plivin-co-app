import { useState, useEffect } from "react";
import {
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

  const goToPackage = () =>
    setSession((s) => ({ ...s, step: "package" }));

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
      return <WelcomeScreen onStart={goToPackage} />;

    case "package":
      return (
        <PackageSelector
          onSelect={selectPackage}
          onBack={() => setSession((s) => ({ ...s, step: "welcome" }))}
        />
      );

    case "payment":
      // Payment disabled temporarily: skip straight to layout setup
      if (session.selectedPackage) {
        setSession((s) => ({ ...s, step: "setup", isPaid: true }));
      } else {
        setSession((s) => ({ ...s, step: "package" }));
      }
      return null;

    case "setup":
      return session.selectedPackage ? (
        <LayoutSelectionScreen
          session={session}
          onSelect={onLayoutSelected}
          onBack={() => setSession((s) => ({ ...s, step: "package" }))}
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
      return <WelcomeScreen onStart={goToPackage} />;
  }
};

export default SessionManager;
