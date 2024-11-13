const BASE_URL = "http://localhost:8080";

// 숙소 정보 조회
export const fetchAccommodations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/accommodations`);

    if (!response.ok) {
      throw new Error("숙소 조회에 실패했습니다");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    throw error;
  }
};

export const searchAccommodations = async (searchParams) => {
  try {
    const { region, checkIn, checkOut, person } = searchParams;

    // 검색 파라미터 로깅
    console.log("검색 파라미터:", searchParams);

    const queryString = new URLSearchParams({
      region,
      checkIn,
      checkOut,
      person: person.toString(),
    }).toString();

    const url = `${BASE_URL}/search?${queryString}`;
    console.log("요청 URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "숙소 검색에 실패했습니다");
    }

    const data = await response.json();
    console.log("검색 결과:", data);
    return data;
  } catch (error) {
    console.error("Error searching accommodations:", error);
    throw error;
  }
};
