import CafeMap from "./components/Map";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <div className="navbar">
        <h1>Cafedex</h1>
        <p>Ola</p>
      </div>
      <div className="flex-1">
        <CafeMap />
      </div>
    </div>
  );
}