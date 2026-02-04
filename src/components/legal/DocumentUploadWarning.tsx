import { AlertTriangle, Shield, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentUploadWarningProps {
  className?: string;
}

const DocumentUploadWarning = ({ className }: DocumentUploadWarningProps) => {
  return (
    <Alert variant="default" className={`border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Ochrona danych osobowych (RODO)
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300 space-y-2 mt-2">
        <p>
          <strong>Przed wgraniem dokumentu upewnij się, że usunięto z niego:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
          <li>Numery PESEL</li>
          <li>Adresy zamieszkania</li>
          <li>Numery dowodów osobistych</li>
          <li>Numery telefonów i adresy e-mail</li>
          <li>Numery kont bankowych</li>
          <li>Inne dane identyfikujące osoby</li>
        </ul>
        <div className="flex items-center gap-2 mt-3 text-xs">
          <Shield className="w-4 h-4" />
          <span>Chronimy Twoją prywatność zgodnie z RODO</span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DocumentUploadWarning;
