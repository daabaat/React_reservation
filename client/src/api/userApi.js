// 사용자 정보 조회
export const fetchUsers = async () => {
  try {
    const response = await fetch(`http://localhost:8080/users`);

    if (!response.ok) {
      throw new Error("사용자 정보 조회에 실패했습니다");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
