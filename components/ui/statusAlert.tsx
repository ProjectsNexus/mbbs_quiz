"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StatusDialogProps {
  status: string | null;
  onClose: () => void;
}

export function StatusDialog({ status, onClose }: StatusDialogProps) {
  if (!status) return null;

  const isSuccess = status.startsWith("✅");

  return (
    <AlertDialog open={!!status} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={isSuccess ? "text-green-600" : "text-red-600"}>
            {isSuccess ? "Success" : "Error"}
          </AlertDialogTitle>
          <AlertDialogDescription>{status}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>OK</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
