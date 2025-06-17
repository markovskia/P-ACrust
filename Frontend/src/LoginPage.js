import React from "react";
import "./LoginPage.css";
import PACrustLogo from "./images/pacrustlogo.png"
import pizzaImage from "./images/pizza-image.png"
import secondPizza from "./images/secondPizza.png"

export default function LoginPage(){
    return (
        <div className="login-container">
      <aside className="sidebar">
        <div>
          <img className="logo2" src={PACrustLogo} alt={PACrustLogo}/>
          </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <div className="phone">📞 075-142-589</div>
          <button className="login-btn">LOG IN / SIGN IN</button>
        </div>

        <div className="wrap">
          <div className="text-part">
              <h1 className="no-margin">Looking for the best pizza in town?</h1>
              <h2 className="no-margin">Log in and order NOW!</h2>
          </div>
          <div className="login-part">
              <div className="form-container">
                <form className="login-form">

                  <div className="input-group">
                    <input type="text" placeholder="Username"/>
                  </div>

                  <div className="input-group">
                    <input type="password" placeholder="Password"/>
                  </div>

                  <button className="login-button" type="submit">Log in</button>

                  <div className="separator">
                  <hr />
                  <span>Or log in with</span>
                  <hr />
                  </div>

                  <div className="social-buttons">
                    <button className="google-btn">G</button>
                    <button className="facebook-btn">f</button>
                  </div>
                </form>
            </div>
          </div>
        </div>

      </main>
        </div>
    )
}
