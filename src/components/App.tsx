import GameComponent from "./Game.Component";
import Header from "./layout/Header.Component";
import Footer from "./layout/Footer.Component";

import "../styles/app.scss";

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-content">
        <GameComponent />
      </div>
      <Footer />
    </div>
  );
}

export default App;
