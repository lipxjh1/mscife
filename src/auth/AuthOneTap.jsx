import { useGoogleOneTapLogin } from "@react-oauth/google";

function AuthOneTap({ onSuccess, onError }) {
    useGoogleOneTapLogin({
        onSuccess: (response) => {
            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(response);
            }
        },
        onError: () => {
            if (onError && typeof onError === "function") {
                onError();
            }
        },
    });

    return null;
}

export default AuthOneTap;
