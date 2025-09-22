import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
  customerName?: string;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const DeleteConversationDialog = ({
  open,
  onOpenChange,
  conversationId,
  customerName,
  onDelete,
  isDeleting,
}: DeleteConversationDialogProps) => {
  if (!conversationId) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Conversation
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the conversation with{" "}
            <strong>{customerName}</strong>? This action cannot be undone and all messages will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete(conversationId);
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Conversation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConversationDialog;