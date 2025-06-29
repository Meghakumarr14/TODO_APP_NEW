const Login = () => {
  return (
    <div className="login-container">
      <h2>Login With</h2>

      <a href="http://localhost:5000/api/auth/google">
        <button className="google">Login with Google</button>
      </a>

      <a href="http://localhost:5000/api/auth/github">
        <button className="github">Login with GitHub</button>
      </a>

      <a href="http://localhost:5000/api/auth/facebook">
        <button className="facebook">Login with Facebook</button>
      </a>
    </div>
  );
};

export default Login;
