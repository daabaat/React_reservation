const BASE_URL = "http://localhost:8080";

export const searchAccommodations = async (searchParams) => {
  try {
    const { region, checkIn, checkOut, person } = searchParams;
    const queryParams = new URLSearchParams();

    if (!person) {
      throw new Error("인원 수를 입력해주세요.");
    }

    if (region) queryParams.append("region", region);
    queryParams.append("person", person.toString());
    if (checkIn) queryParams.append("checkIn", checkIn);
    if (checkOut) queryParams.append("checkOut", checkOut);

    console.log("검색 요청:", {
      URL: `${BASE_URL}/search`,
      params: Object.fromEntries(queryParams),
    });

    const response = await fetch(`${BASE_URL}/search?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "검색에 실패했습니다");
    }

    const data = await response.json();
    console.log("검색 결과:", data);
    return data;
  } catch (error) {
    console.error("검색 중 오류 발생:", error);
    throw error;
  }
};
