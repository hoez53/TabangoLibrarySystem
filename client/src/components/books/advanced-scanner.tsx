import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, RefreshCw, QrCode, Scan } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedScannerProps {
  onDetected: (result: string) => void;
  className?: string;
}

export function AdvancedScanner({ onDetected, className }: AdvancedScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    // Initialize scanner when component mounts
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    // Clean up when component unmounts
    return () => {
      if (scannerRef.current && isCameraActive) {
        scannerRef.current.stop()
          .catch(error => console.error("Error stopping camera:", error));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const qrCodeSuccessCallback = (decodedText: string) => {
        onDetected(decodedText);
        // Don't stop scanner here so user can scan multiple items
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await scannerRef.current.start(
        { facingMode: "environment" }, 
        config, 
        qrCodeSuccessCallback,
        undefined
      );
      
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Could not access camera. Please check permissions and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current || !isCameraActive) return;
    
    try {
      await scannerRef.current.stop();
      setIsCameraActive(false);
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  const toggleScanner = () => {
    if (isCameraActive) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div id={scannerContainerId} className="relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center">
        {!isCameraActive && (
          <div className="text-center p-4">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Camera preview will appear here
            </p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
        
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 right-0 h-0.5 bg-primary/50 animate-scan-line"></div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant={isCameraActive ? "default" : "outline"}
          onClick={toggleScanner}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : isCameraActive ? (
            <CameraOff className="h-4 w-4 mr-2" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          {isCameraActive ? "Stop Camera" : "Start Camera"}
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => onDetected("9780743273565")} // Sample ISBN for testing
          disabled={isLoading}
        >
          <Scan className="h-4 w-4 mr-2" />
          Simulate Scan
        </Button>
      </div>
    </div>
  );
}