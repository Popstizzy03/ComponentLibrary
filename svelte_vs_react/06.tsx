// Loop 
export default function Colors() {
  const colors = ["Red", "Blue", "Yellow"];
  return (
    <ul>
      {colors.map((color) => (
        <li key={color}>{color}</li>
      ))}
    </ul>
  )
}
