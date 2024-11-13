const BASE_URL = "http://localhost:8080";

// 예약 데이터 조회
export const fetchReservations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reservations`);

    if (!response.ok) {
      throw new Error("예약 조회에 실패했습니다");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};

// 새 예약 생성
export const createReservation = async (checkin, checkout) => {
  try {
    const response = await fetch(`${BASE_URL}/reservations/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: checkin, endDate: checkout }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "예약 생성에 실패했습니다");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
};

// 예약 삭제
export const deleteReservation = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/reservations/delete/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("예약 삭제에 실패했습니다");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting reservation:", error);
    throw error;
  }
};

// 예약 수정
export const updateReservation = async (id, checkin, checkout) => {
  try {
    const response = await fetch(`${BASE_URL}/reservations/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: checkin,
        endDate: checkout,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
};
