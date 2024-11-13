import { useState } from "react";
import { searchAccommodations } from "../api/accommodationApi";

const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    region: "",
    checkIn: "",
    checkOut: "",
    person: 1,
  });
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await searchAccommodations(searchParams);
      setResults(data);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <select
        value={searchParams.region}
        onChange={(e) =>
          setSearchParams({ ...searchParams, region: e.target.value })
        }
      >
        <option value="">지역 선택</option>
        <option value="서울">서울</option>
        <option value="경기">경기</option>
        <option value="경북">경북</option>
        {/* ... 다른 지역들 ... */}
      </select>

      <input
        type="date"
        value={searchParams.checkIn}
        onChange={(e) =>
          setSearchParams({ ...searchParams, checkIn: e.target.value })
        }
      />

      <input
        type="date"
        value={searchParams.checkOut}
        onChange={(e) =>
          setSearchParams({ ...searchParams, checkOut: e.target.value })
        }
      />

      <input
        type="number"
        value={searchParams.person}
        onChange={(e) =>
          setSearchParams({ ...searchParams, person: e.target.value })
        }
        min="1"
      />

      <button type="submit">검색</button>

      {/* 검색 결과 표시 */}
      <div className="search-results">
        {results.map((acc) => (
          <div key={acc._id} className="accommodation-card">
            <h3>{acc.name}</h3>
            <p>{acc.address}</p>
            <p>가격: {acc.price.toLocaleString()}원</p>
          </div>
        ))}
      </div>
    </form>
  );
};

export default SearchForm;
