import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  coordinates: { lat: number; lon: number } | null;
  permissionStatus: PermissionState | 'prompt' | 'checking' | null; // 'granted', 'denied', 'prompt'
  error: GeolocationPositionError | Error | null;
  isLoading: boolean;
}

export function useLocation() {
  const [locationState, setLocationState] = useState<LocationState>({
    coordinates: null,
    permissionStatus: 'checking',
    error: null,
    isLoading: true, // Start loading initially to check permission
  });

  const checkAndRequestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationState((prev) => ({
        ...prev,
        error: new Error('Geolocation is not supported by this browser.'),
        permissionStatus: 'denied', // Treat as denied if not supported
        isLoading: false,
      }));
      return false;
    }

    try {
      // Check current permission status
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationState((prev) => ({ ...prev, permissionStatus: permission.state }));

      if (permission.state === 'granted') {
        return true; // Permission already granted
      } else if (permission.state === 'prompt') {
        // We can't directly trigger the prompt here without an action like getCurrentPosition
        // But we know the status is prompt. We'll trigger fetching which requests permission.
        return 'prompt'; // Indicate we need to prompt
      } else {
        // denied
        setLocationState((prev) => ({
          ...prev,
          error: new Error('Geolocation permission denied.'),
          isLoading: false,
        }));
        return false;
      }
    } catch (error) {
      // This might happen if the Permissions API itself isn't fully supported or another error occurs
      console.error("Error checking geolocation permission:", error);
      // Fallback: Attempt to get location directly, which will trigger the prompt if needed
      // but set state assuming it might be prompt or denied
      setLocationState((prev) => ({
        ...prev,
        permissionStatus: 'prompt', // Assume prompt as a fallback
        error: error instanceof Error ? error : new Error('Error checking permission'),
        // Keep isLoading true as we'll try fetching next
      }));
      return 'prompt'; // Indicate we need to prompt as a fallback
    }
  }, []);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
        // Already handled in checkAndRequestPermission, but good practice
        return;
    }

    setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          permissionStatus: 'granted',
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setLocationState((prev) => ({
          ...prev,
          coordinates: null,
          // If an error occurs, the permission might now be denied or still prompt
          // Re-check might be complex, let's simplify and reflect the error
          permissionStatus: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionStatus,
          error: error,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0, // Force fresh location
      }
    );
  }, []);

  // Effect to check permission on mount
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
        const permissionResult = await checkAndRequestPermission();
        if (!isMounted) return;

        if (permissionResult === true) {
            // Permission granted, fetch location immediately
            fetchLocation();
        } else if (permissionResult === 'prompt') {
             // If permission is 'prompt', attempting to fetch will trigger the browser prompt.
             // We don't want to fetch automatically if it requires a prompt on load.
             // Let a user action trigger fetchLocation.
            setLocationState((prev) => ({ ...prev, isLoading: false }));
            // Or uncomment below to fetch immediately (triggers prompt on load)
            // fetchLocation();
        }
        // If false (denied or unsupported), state is already set by checkAndRequestPermission
    };

    initLocation();

    // Optional: Listen for permission changes (might need browser restart to reflect sometimes)
    const handlePermissionChange = (permissionStatus: PermissionStatus) => {
        if (!isMounted) return;
        setLocationState(prev => ({ ...prev, permissionStatus: permissionStatus.state }));
        if(permissionStatus.state === 'granted') {
            // If permission granted later, fetch location
            fetchLocation();
        } else if (permissionStatus.state === 'denied') {
            setLocationState(prev => ({
                ...prev,
                error: new Error('Geolocation permission denied.'),
                coordinates: null,
                isLoading: false
            }));
        }
    };

    navigator.permissions?.query({ name: 'geolocation' }).then(ps => {
        if (isMounted) {
            ps.onchange = () => handlePermissionChange(ps);
        }
    }).catch(err => console.warn("Could not attach permission change listener:", err));


    return () => {
        isMounted = false;
        // Cleanup: remove permission change listener if needed, though it might be handled by browser GC
    };
  }, [checkAndRequestPermission, fetchLocation]); // Dependencies ensure functions are stable if needed

  // Function to manually trigger fetching location (e.g., on button click)
  const requestAndFetchLocation = useCallback(() => {
      // fetchLocation itself triggers the prompt if status is 'prompt'
      fetchLocation();
  }, [fetchLocation]);


  return { ...locationState, requestAndFetchLocation };
} 