export const login = async (id, password) => {
  try {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("로그인 에러:", error);
    throw error;
  }
};
