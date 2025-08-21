export default function Home() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 2, background: "lightgray" }}>Draft</div>
      <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "pink" }}>Opponent Deck</div>
        <div style={{ flex: 1, background: "lightblue" }}>Your Deck</div>
      </div>
    </div>
  );
}
