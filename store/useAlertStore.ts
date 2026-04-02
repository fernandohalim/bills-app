import { create } from "zustand";

type AlertType = "alert" | "confirm";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirmAction?: () => void;
}

interface AlertActions {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string,
    confirmText?: string
  ) => void;
  close: () => void;
  confirm: () => void;
}

export const useAlertStore = create<AlertState & AlertActions>((set, get) => ({
  isOpen: false,
  type: "alert",
  title: "",
  message: "",
  confirmText: "got it",
  cancelText: "cancel",
  onConfirmAction: undefined,
  showAlert: (message, title = "hold up! 🛑") =>
    set({
      isOpen: true,
      type: "alert",
      message,
      title,
      confirmText: "got it!",
      onConfirmAction: undefined,
    }),

  showConfirm: (
    message,
    onConfirm,
    title = "are you sure? 🤔",
    confirmText = "yes, do it!"
  ) =>
    set({
      isOpen: true,
      type: "confirm",
      message,
      title,
      confirmText,
      cancelText: "nevermind",
      onConfirmAction: onConfirm,
    }),

  close: () => set({ isOpen: false }),

  confirm: () => {
    const { onConfirmAction, close } = get();
    if (onConfirmAction) onConfirmAction();
    close();
  },
}));