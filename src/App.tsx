import { NavBar } from "./NavBar";

function App() {
  return (
    <>
      <NavBar />
      <div className="container" style={{ width: 400 }}>
        <div id="carouselExampleControls" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="favicon.ico" className="d-block w-100" alt="A" />
            </div>
            <div className="carousel-item">
              <img src="favicon.ico" className="d-block w-100" alt="B" />
            </div>
            <div className="carousel-item">
              <img src="favicon.ico" className="d-block w-100" alt="C" />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      <div className="container" >
        <div className="row">
          <div className="col-md-4">
            <h5 className="card-title">Card title</h5>
            AAAAAAAAAAAAA
          </div>
          <div className="col-md-4">
            <h5 className="card-title">Card title</h5>
            AAAAAAAAAAAAA
          </div>
          <div className="col-md-4">
            <h5 className="card-title">Card title</h5>
            AAAAAAAAAAAAA
          </div>
        </div>
      </div >
    </>
  );
}

export default App;
