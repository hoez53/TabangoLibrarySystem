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
import { QrCode, Scan } from "lucide-react";
import { AdvancedScanner } from "./advanced-scanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("camera");

  // Handle manual barcode input
  const handleManualScan = () => {
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

  // Handle scan from camera
  const handleCameraScan = (result: string) => {
    toast({
      title: "Barcode detected",
      description: `ISBN ${result} detected through camera.`,
    });
    
    // Set the result in the input field in case user wants to edit
    setManualBarcode(result);
    
    // Optionally auto-submit
    // onScan(result);
    // onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setManualBarcode("");
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="mr-2 h-5 w-5" />
            Scan Book Barcode/QR Code
          </DialogTitle>
          <DialogDescription>
            Scan a book's barcode or ISBN to quickly find it in the catalog.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="camera" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="camera">Camera Scanner</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <AdvancedScanner onDetected={handleCameraScan} />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">ISBN/Barcode</Label>
              <Input 
                id="barcode"
                placeholder="Enter book ISBN or barcode" 
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the ISBN code printed on the book or from any other source.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleManualScan}>
            <Scan className="mr-2 h-4 w-4" />
            Use This Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}