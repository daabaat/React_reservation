const BASE_URL = "http://localhost:8080";

// 숙소 정보 조회
export const fetchAccommodations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/accommodations`);

    if (!response.ok) {
      throw new Error("숙소 정보 조회에 실패했습니다");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    throw error;
  }
};
