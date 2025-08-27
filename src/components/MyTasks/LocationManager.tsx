// components/MyTasks/LocationManager.tsx
import React from "react";
import { MapPin, RefreshCw, Shield } from "lucide-react";

interface LocationState {
  lat: number;
  lon: number;
}

interface LocationContextType {
  currentLocation: LocationState | null;
  locationAddress: string;
  locationLoading: boolean;
  locationPermission: "granted" | "denied" | "prompt" | "checking";
  locationError: string;
  showLocationAlert: boolean;
  getCurrentLocation: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
  setShowLocationAlert: (show: boolean) => void;
  refreshLocationStatus: () => Promise<void>;
}

interface LocationManagerProps {
  locationContext: LocationContextType;
  children: React.ReactNode;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  locationContext,
  children,
}) => {
  const {
    locationPermission,
    locationError,
    locationLoading,
    requestLocationPermission,
    refreshLocationStatus,
  } = locationContext;

  if (locationPermission !== "granted") {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md sm:max-w-lg w-full p-4 sm:p-8 text-center max-h-[90vh] overflow-y-auto">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Location Access Required
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              This application requires location access to function properly
            </p>
          </div>

          {/* Status Message */}
          <div className="mb-6">
            {locationPermission === "checking" && (
              <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm sm:text-base">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Checking location permissions...</span>
              </div>
            )}

            {locationPermission === "prompt" && (
              <div className="text-gray-700 text-sm sm:text-base">
                <p className="mb-3">
                  Please allow location access when prompted by your browser
                </p>
              </div>
            )}

            {locationPermission === "denied" && (
              <div className="text-red-600 text-sm sm:text-base">
                <p className="mb-3 font-medium">
                  Location access has been denied
                </p>
                {locationError && (
                  <p className="text-xs sm:text-sm text-red-500 mb-3">
                    {locationError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={async () => {
                await requestLocationPermission();
              }}
              disabled={locationLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <MapPin className="w-5 h-5" />
              <span>
                {locationLoading
                  ? "Requesting Access..."
                  : "Enable Location Access"}
              </span>
            </button>

            <button
              onClick={() => refreshLocationStatus()}
              disabled={locationLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <RefreshCw
                className={`w-5 h-5 ${locationLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
              How to enable location:
            </h4>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-3">
              {/* Step 1 */}
              <li>
                <span className="text-blue-600 font-bold">
                  ✅ Step 1: Turn On Device Location
                </span>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>
                    <strong>Windows:</strong> Settings → Privacy & Security →
                    Location → Turn ON
                  </li>
                  <li>
                    <strong>Mac:</strong> System Settings → Privacy & Security →
                    Location Services → Turn ON and allow for your browser
                  </li>
                  <li>
                    <strong>Mobile (Android/iPhone):</strong> Settings → Location
                    → Turn ON
                  </li>
                </ul>
              </li>

              {/* Step 2 */}
              <li>
                <span className="text-blue-600 font-bold">
                  ✅ Step 2: Allow Browser to Use Location
                </span>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>
                    <strong>Google Chrome:</strong> ⋮ Menu → Settings → Privacy &
                    Security → Site Settings → Location → Allow
                  </li>
                  <li>
                    <strong>Safari (Mac/iPhone):</strong>
                    <br />
                    Mac → Preferences → Websites → Location
                    <br />
                    iPhone → Settings → Safari → Location
                    <br />
                    Set to Ask or Allow
                  </li>
                </ul>
              </li>

              {/* Step 3 */}
              <li>
                <span className="text-blue-600 font-bold">
                  ✅ Step 3: Give Access to Specific Website
                </span>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Open the website you want to use location on</li>
                  <li>If prompted “Allow location access?”, tap Allow</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Browser-specific help */}
          <div className="mt-4 text-[10px] sm:text-xs text-gray-500">
            <p>
              If you're still having trouble, try refreshing the page or
              restarting your browser
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
