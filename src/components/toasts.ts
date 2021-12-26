import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

/*** Wrapped Toast Methods ***/

/**
 * Closes/dismisses all active toasts.
 */
const dismissAll = () => toast.dismiss();

/**
 * Displays a success toast.
 * @param message string, the message to display.
 */
const toastSuccess = (message: string) =>  toast.success(message, {
    position: "bottom-right",
    autoClose: 1000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    style: {fontSize: 13}
});

/**
 * Displays an error toast.
 * @param message string, the message to display.
 */
const toastError = (message: string) => toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {fontSize: 13}
});

export { dismissAll, toastSuccess, toastError };
