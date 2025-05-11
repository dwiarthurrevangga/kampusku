import React from 'react';

function Register() {
  return (
    <div className="col-md-6 offset-md-3">
      <h2>Register</h2>
      <form>
        <div className="mb-3">
          <label>Username</label>
          <input type="text" className="form-control" />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" />
        </div>
        <button className="btn btn-success w-100">Register</button>
      </form>
    </div>
  );
}

export default Register;
