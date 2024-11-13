import { useState, useEffect } from "react";
import { searchAccommodations } from "../api/searchApi";
import { fetchTimeSlots } from "../api/timeSlotApi";

const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    region: "",
    checkIn: "",
    checkOut: "",
    person: 1,
  });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!searchParams.person) {
        alert("인원 수를 입력해주세요.");
        return;
      }

      if (
        (searchParams.checkIn && !searchParams.checkOut) ||
        (!searchParams.checkIn && searchParams.checkOut)
      ) {
        alert("체크인과 체크아웃 날짜를 모두 선택해주세요.");
        return;
      }

      const data = await searchAccommodations(searchParams);
      setResults(data);
    } catch (error) {
      console.error("검색 실패:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
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
        <option value="">전체</option>
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
        onChange={(e) =>
          setSearchParams({ ...searchParams, person: e.target.value })
        }
        min="1"
        placeholder="인원"
      />

      <button type="submit">검색</button>

      {/* 검색 결과 표시 */}
      <div className="search-results">
        {results.length > 0 ? (
          results.map((acc) => (
            <div key={acc._id} className="accommodation-card">
              <h3>{acc.name}</h3>
              <p>지역: {acc.region}</p>
              <p>주소: {acc.address}</p>
              <p>
                기준인원: {acc.person}명 (최대 {acc.max_person}명)
              </p>
              <p>가격: {acc.price.toLocaleString()}원</p>
            </div>
          ))
        ) : (
          <p>검색 조건에 맞는 숙소가 없습니다.</p>
        )}
      </div>
    </form>
  );
};

export default SearchForm;
