const Login = () => {
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  return (
    <div className="login-container">
      <h2>Login With</h2>

      <a href={`${backendURL}/api/auth/google`}>
        <button className="google">Login with Google</button>
      </a>

      <a href={`${backendURL}/api/auth/github`}>
        <button className="github">Login with GitHub</button>
      </a>

      <a href={`${backendURL}/api/auth/facebook`}>
        <button className="facebook">Login with Facebook</button>
      </a>
    </div>
  );
};

export default Login;
