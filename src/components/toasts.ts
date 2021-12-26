import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const dismissAll = () => toast.dismiss();
const toastSuccess = () =>  toast.success("Succesfully Assembled!", {
    position: "bottom-right",
    autoClose: 1000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    style: {fontSize: 13}
});
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