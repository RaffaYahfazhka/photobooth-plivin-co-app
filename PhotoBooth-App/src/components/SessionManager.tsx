import { useState } from "react";
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
import CameraView from "./CameraView";

const SessionManager = () => {
  const [session, setSession] = useState<BoothSession>(INITIAL_SESSION);

  /* ---- Step transitions ---- */

  const goToPackage = () =>
    setSession((s) => ({ ...s, step: "package" }));

  const selectPackage = (pkg: BoothPackage) =>
    setSession((s) => ({ ...s, step: "payment", selectedPackage: pkg }));

  const onPaymentSuccess = () =>
    setSession((s) => ({ ...s, step: "capture", isPaid: true }));

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

  const resetSession = () => setSession(INITIAL_SESSION);

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
      return session.selectedPackage ? (
        <PaymentScreen
          selectedPackage={session.selectedPackage}
          onPaymentSuccess={onPaymentSuccess}
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
