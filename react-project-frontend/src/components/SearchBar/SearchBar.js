import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

export default function SearchBar({ name, setName, nameFilter }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      nameFilter(); 
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search recipes..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown} 
        className="search-input"
      />
      <button onClick={nameFilter} className="search-button" title="Search">
        <FaSearch />
      </button>
    </div>
  );
}
