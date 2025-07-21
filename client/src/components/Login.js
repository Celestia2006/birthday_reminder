const Login = ({ showHeader = false }) => {
  const { login, setLoginSource } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = React.useState("");

  const { fromWish = false, wishId = null } = location.state || {};

  useEffect(() => {
    if (fromWish) {
      setLoginSource("wish");
    }
  }, [fromWish, setLoginSource]);

  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials);

      if (result?.success) {
        if (fromWish && wishId) {
          navigate(`/wish/${wishId}`, { replace: true });
        } else {
          navigate("/", {
            state: { fromLogin: true, isNewLogin: true },
            replace: true,
          });
        }
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="app-wrapper">
      <StarsBackground />
      {showHeader && <Header />}
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
    </div>
  );
};
