const BASE_URL = "http://localhost:8080";

// 타임슬롯 조회
export const fetchTimeSlots = async () => {
  try {
    const response = await fetch(`${BASE_URL}/timeslots`);

    if (!response.ok) {
      throw new Error("타임슬롯 조회에 실패했습니다");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching timeslots:", error);
    throw error;
  }
};
