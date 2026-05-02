import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/features/auth/services/authService";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);

      // Fetch user info
      authService
        .getMe()
        .then((res) => {
          setUser(res.data?.data ?? res.data);
          navigate("/dashboard", { replace: true });
        })
        .catch((err) => {
          console.error("Failed to get user after oauth", err);
          navigate("/login", { replace: true });
        });
    } else {
      console.error("Missing tokens in URL");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setTokens, setUser]);

  return (
    <div
      className="view active"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h2 className="form-title">Completing login...</h2>
    </div>
  );
}
