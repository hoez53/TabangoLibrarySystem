import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Scan, 
  Camera, 
  CameraOff, 
  RefreshCw 
} from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerModal({ 
  isOpen, 
  onClose, 
  onScan 
}: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  // Simulate scanning a barcode
  const handleScan = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      toast({
        title: "Barcode scanned",
        description: `ISBN ${manualBarcode} has been scanned successfully.`,
      });
      onClose();
    } else {
      toast({
        title: "Empty barcode",
        description: "Please enter a valid barcode/ISBN number.",
        variant: "destructive"
      });
    }
  };

  // Simulate toggling the camera
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    
    if (!cameraActive) {
      toast({
        title: "Camera activated",
        description: "In a real implementation, this would access your camera to scan barcodes.",
      });
    }
  };

  // Simulate auto-scanning (for demo purposes)
  const simulateScan = () => {
    const demoISBNs = [
      "9780743273565", // The Great Gatsby
      "9780061120084", // To Kill a Mockingbird
      "9780451524935", // 1984
      "9780141439518"  // Pride and Prejudice
    ];
    
    const randomISBN = demoISBNs[Math.floor(Math.random() * demoISBNs.length)];
    setManualBarcode(randomISBN);
    
    toast({
      title: "Barcode detected",
      description: `ISBN ${randomISBN} detected through camera.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setManualBarcode("");
        setCameraActive(false);
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="mr-2 h-5 w-5" />
            Scan Book Barcode
          </DialogTitle>
          <DialogDescription>
            Scan a book's barcode or ISBN to quickly find it in the catalog.
          </DialogDescription>
        </DialogHeader>
        
        {cameraActive && (
          <div className="relative bg-gray-100 rounded-md overflow-hidden h-48 mb-4 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Camera preview would appear here</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3"
                onClick={simulateScan}
              >
                <Scan className="mr-2 h-4 w-4" />
                Simulate Scan
              </Button>
            </div>
            {/* Scan animation overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 right-0 h-0.5 bg-primary/50 animate-scan-line"></div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">ISBN/Barcode</Label>
            <div className="flex gap-2">
              <Input 
                id="barcode"
                placeholder="Enter book ISBN or barcode" 
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
              />
              <Button variant="outline" onClick={toggleCamera}>
                {cameraActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleScan}>
            <Scan className="mr-2 h-4 w-4" />
            Scan Barcode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}